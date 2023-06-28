import {Injectable} from "@angular/core";
import {BalanceService} from "./balance.service";
import {Observable, tap} from "rxjs";
import {BalanceState} from "./balance.state";
import {Router} from "@angular/router";
import {FilterByStatusEnum} from "../../vacancy/constants/filter-by-status.enum";
import {VacancyState} from "../../vacancy/services/vacancy.state";
import {RobotHelperService} from "src/app/shared/services/robot-helper.service";
import {LocalStorageService} from "src/app/shared/services/local-storage.service";
import {VacancyFacade} from "../../vacancy/services/vacancy.facade";
import {ICompany, IHelper} from "src/app/shared/interfaces/company.interface";
import {IRobotHelper} from "src/app/shared/interfaces/robot-helper.interface";
import {IBalanceTariff} from "src/app/shared/interfaces/balance-tariff.interface";
import {IMyVacancyFilter} from "../../vacancy/interfaces/my-vacancy-filter.interface";
import {IPaidList} from "src/app/shared/interfaces/paid-list.interface";
import {getDiffDays} from "src/app/shared/helpers/get-diff-days.helper";
import {IVacancy} from "src/app/shared/interfaces/vacancy.interface";
import {IAddVacancy} from "src/app/shared/interfaces/add-vacancy.interface";
import {CompanyFacade} from "../../company/services/company.facade";

@Injectable({
  providedIn: "root",
})
export class BalanceFacade{
  constructor(
    private readonly _balanceService: BalanceService,
    private readonly _vacancyState: VacancyState,
    private readonly _companyFacade: CompanyFacade,
    private readonly _balanceState: BalanceState,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _localStorage: LocalStorageService,
    private readonly _vacancyFacade: VacancyFacade,
    private readonly _router: Router
  ) {}

  public deleteVacancy(uuid: string | undefined): void {
    this._vacancyState.deleteVacancy(uuid);
    this._balanceService.deleteVacancy(uuid).subscribe();
  }

  public balanceTariffCount(): void {
    this._companyFacade.getCompanyData$().subscribe((company) => {
      if (company.packageCount) {
        this._balanceState.setTariffCountUnChanged(company.packageCount);
      }
    });
  }

  public buyNotPayedVacancy(vacancyUuid: string | undefined): Observable<IAddVacancy> {
    return this._balanceService.buyNotPayedVacancy(vacancyUuid);
  }

  public getUnpaidVacancyList(pageNumber: number, searchParams: IMyVacancyFilter = {}): Observable<IAddVacancy> {
    const limit = 10;
    const end = pageNumber * limit;
    const start = end - limit;
    searchParams["payedStatus"] = FilterByStatusEnum.NOT_PAYED;
    delete searchParams["status"];
    delete searchParams["from"];
    delete searchParams["to"];
    return this._balanceService.getAllVacancies(start, searchParams);
  }

  public getProgress(vacancyProps: IVacancy): string {
    const day = getDiffDays(vacancyProps.deadlineDate);
    const days = [2, 3, 4];
    if (day < 0) {
      return "100%";
    } else if (day === 0) {
      return "1 день";
    } else if (days.includes(day)) {
      return `${day} дня`;
    }
    return `${day - 1} дней`;
  }

  public getProgressPercent(vacancyProps: IVacancy): number {
    const x = getDiffDays(vacancyProps.deadlineDate);
    let y: number = 0;
    if (vacancyProps.createdAt) {
      y = getDiffDays(vacancyProps.deadlineDate, vacancyProps.createdAt);
    }
    if (x < 0) {
      return 100;
    }
    return ((y - x) * 100) / y;
  }

  public getStatus(vacancyProps: IVacancy): string {
    return vacancyProps.status ? "Завершенные" : "Открытие";
  }

  public isRobot(company: ICompany): void {
    const balance = company.helper?.find((item: IHelper) => item.link === this._router.url);
    this.setSelectedContentReference("cards");
    this.setRobotSettings({
      content: [
        `<p id="cards" style="cursor: pointer"> cards</p>`,
        `<span id="paymentHistory" style="cursor: pointer"> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. </span>`,
        `<span id="unpaidVacancies" style="cursor: pointer"> unpaidVacancies </span>`,
      ],
      navigationItemId: null,
      isContentActive: true,
    });

    if (balance && !balance?.hidden) {
      this.setRobotSettings({
        content: [
          `<span id="cards" style="cursor: pointer"> cards </span>`,
          `<span id="paymentHistory" style="cursor: pointer"> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. </span>`,
          `<span id="unpaidVacancies" style="cursor: pointer"> unpaidVacancies </span>`,
        ],
        navigationItemId: 6,
        isContentActive: false,
        uuid: balance.uuid,
      });
      this.setIsRobotOpen(true);
    }
  }

  public setRobotSettings(settings: IRobotHelper): void {
    this._robotHelperService.setRobotSettings({
      content: settings.content,
      navigationItemId: settings.navigationItemId,
      isContentActive: settings.isContentActive,
      uuid: settings?.uuid,
      link: settings?.link,
    });
  }

  public setIsRobotOpen(robotOpenAction: boolean): void {
    this._robotHelperService.isRobotOpen$.next(robotOpenAction);
  }

  public getCompanyBalanceOrders(
    start: number,
    searchParams: IMyVacancyFilter
  ): Observable<{ result: IPaidList[]; count: number }> {
    return this._balanceService.getCompanyBalanceOrders(start, searchParams);
  }

  // State getters
  public getAllVacancies(end: number): void {
    this._balanceService.getAllVacancies(end).subscribe((vacanciesData) => {
      this._vacancyState.setAllVacancies(vacanciesData);
    });
  }

  public setAllBalanceTariff(): Observable<IBalanceTariff[]> {
    return this._balanceService.getCompanyTariff().pipe(
      tap((balance) => {
        this._vacancyState.setCompanyBalance(balance);
      })
    );
  }

  public getCompanyBalance(): Observable<IBalanceTariff[]> {
    return this._vacancyState.getCompanyBalance();
  }

  public getSelectedContentReference(): Observable<string> {
    return this._balanceState.getSelectedContentReference();
  }

  public getTariffBouth(): Observable<boolean> {
    return this._balanceState.getTariffBouth();
  }

  public getIsChooseModalOpen(): Observable<boolean> {
    return this._balanceState.getIsChooseModalOpen();
  }

  // State setters
  public setSelectedContentReference(ref: string): void {
    this._balanceState.setSelectedContentReference(ref);
  }

  public setTariffBoughtFromVacancy(isTariff: boolean): void {
    this._balanceState.setTariffBoughtFromVacancy(isTariff);
  }

  public setTariffCountChanged(): void {
    this._balanceState.setTariffCountChanged();
  }

  public setTariffBouth(isBuy: boolean): void {
    this._balanceState.setTariffBouth(isBuy);
  }

  public setIsChooseModalOpen(isModalOpenAction: boolean): void {
    this._balanceState.setIsChooseModalOpen(isModalOpenAction);
  }
}

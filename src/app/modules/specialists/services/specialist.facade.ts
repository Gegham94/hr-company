import { Injectable } from "@angular/core";
import { Observable, Subject, Subscription, filter, map, of, tap } from "rxjs";
import { SpecialistState } from "./specialist.state";
import { FilteredSpecialistsListRequest, Specialist } from "../interfaces/specialist.interface";
import { ISpecialistFilter } from "../interfaces/specialist-filter-interface";
import { SpecialistService } from "./specialist.service";
import { ISpecialistLists } from "../interfaces/specialist-test.interface";
import { SpecialistInterviewStatusEnum } from "../constants/interviev-status.enum";
import { BalanceFacade } from "../../balance/services/balance.facade";
import { CompanyState } from "../../company/services/company.state";
import { RobotHelperService } from "src/app/shared/services/robot-helper.service";
import { LocalStorageService } from "src/app/shared/services/local-storage.service";
import { IAddVacancyOrNullType } from "../../vacancy/interfaces/add-vacancy-filter.interface";
import { ICompany } from "src/app/shared/interfaces/company.interface";
import { IRobotHelper } from "src/app/shared/interfaces/robot-helper.interface";
import { ISearchableSelectData } from "src/app/shared/interfaces/searchable-select-data.interface";
import { SelectedTabEnum } from "src/app/shared/enum/selectedTab.enum";
import { PopupMessageEnum } from "src/app/shared/enum/popup-message.enum";
import { ICandidatesModal, ISpecialist } from "../specialist-profile/interfaces/specialist.interface";

@Injectable({
  providedIn: "root",
})
export class SpecialistFacade {
  private setSpecialistsNotificationCountHandler$: Subscription = new Subscription();
  private getSpecialistsNotificationCountHandler$: Subscription = new Subscription();
  public openCandidatesModal$: Subject<ICandidatesModal> = new Subject<ICandidatesModal>();
  public openConfirmationModal$: Subject<void> = new Subject<void>();
  public openConversationModals$: Subject<void> = new Subject<void>();

  constructor(
    private readonly _companyState: CompanyState,
    private readonly _specialistService: SpecialistService,
    private readonly _specialistState: SpecialistState,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _localStorage: LocalStorageService,
    private readonly _balanceFacade: BalanceFacade
  ) {}

  public updateFavorites(uuid: string, isFavorite: boolean): Observable<{ data: string }> {
    return this._specialistService.updateFavorites(uuid, isFavorite);
  }

  public updateSpecialistsNotificationCount(): void {
    this.getSpecialistsNotificationCountHandler$ = this._specialistService
      .getSpecialistsNotificationCount()
      .subscribe((data) => {
        this._specialistState.setSpecialistsNotificationCount$(data.count);
        this.getSpecialistsNotificationCountHandler$.unsubscribe();
      });
  }

  public hideOtherSpecialist(specialistUuid: string) {
    return this._specialistService.hideOtherSpecialist(specialistUuid);
  }

  public isRobot(settings: IRobotHelper): void {
    this._robotHelperService.setRobotSettings(settings);
  }

  public openRobot(robotState: boolean): void {
    this._robotHelperService.isRobotOpen$.next(robotState);
  }

  public questionForBuyVacancyAccept(company: ICompany, isError: boolean) {
    switch (isError) {
      case true:
        company.packageCount!--;
        this._localStorage.setItem("company", JSON.stringify(company));
        localStorage.removeItem("vacancyUuid");
        this._balanceFacade.setTariffBouth(false);
        this._specialistState.setBuyVacancyAcceptPaymentMessage(PopupMessageEnum.SUCCESS);
        break;
      case false:
        localStorage.removeItem("vacancyUuid");
        this._balanceFacade.setTariffBouth(false);
        this._specialistState.setBuyVacancyAcceptPaymentMessage(PopupMessageEnum.FAILED);
        break;
    }
  }

  public getSpecialistData(uuid: string): Specialist {
    return this._companyState.specialistData(uuid);
  }

  public getSpecialistsNotificationCount$(): Observable<number> {
    return this._specialistState.getSpecialistsNotificationCount$();
  }

  public getSpecialistsNotificationCount(): number {
    return this._specialistState.getSpecialistsNotificationCount();
  }

  public getIsNavigateFromNotifications$(): Observable<Specialist> {
    return this._specialistState.getIsNavigateFromNotifications$();
  }

  public getFilteredSpecialistList(
    skip: number,
    params: ISpecialistFilter
  ): Observable<FilteredSpecialistsListRequest> {
    return this._specialistService.getFilteredSpecialistList(skip, params);
  }

  public getPercentage(vacancy: IAddVacancyOrNullType): number {
    if (vacancy && vacancy.payedDate) {
      const deadlineDate: Date = new Date(vacancy.deadlineDate);
      const payedDate: Date = new Date(vacancy.payedDate);
      const allDays = Math.ceil((deadlineDate.getTime() - payedDate.getTime()) / (1000 * 3600 * 24));
      const passedDays = Math.ceil((new Date().getTime() - payedDate.getTime()) / (1000 * 3600 * 24)) - 1;
      if (passedDays >= allDays) {
        return 99;
      }
      return Math.ceil((passedDays * 100) / allDays);
    }
    return 0;
  }

  public getNavOptions(searchSelectData: ISearchableSelectData): Observable<ISpecialistFilter> {
    const searchParams: ISpecialistFilter = {};
    switch (searchSelectData.displayName) {
      case SelectedTabEnum.Successfully:
        searchParams["status"] = SpecialistInterviewStatusEnum.SUCCESS;
        break;
      case SelectedTabEnum.Process:
        searchParams["status"] = SpecialistInterviewStatusEnum.InProgress;
        break;
      case SelectedTabEnum.Accepted:
        searchParams["status"] = SpecialistInterviewStatusEnum.ACCEPTED;
        break;
      case SelectedTabEnum.Favorites:
        searchParams["status"] = SpecialistInterviewStatusEnum.FAVORITES;
        break;
      default: {
        delete searchParams.status;
      }
    }
    return of(searchParams);
  }

  public setIsNavigateFromNotifications$(state: boolean): void {
    this._specialistState.setIsNavigateFromNotifications$(state);
  }

  public setSpecialistsNotificationCount(uuid: string): void {
    this.setSpecialistsNotificationCountHandler$ = this._specialistService
      .setSpecialistsNotificationCount(uuid)
      .subscribe(() => {
        this.updateSpecialistsNotificationCount();
        this.setSpecialistsNotificationCountHandler$.unsubscribe();
      });
  }

  // Destroy subscriptions
  public destroySetSpecialistsNotificationCount(): void {
    this.setSpecialistsNotificationCountHandler$.unsubscribe();
  }

  public destroyGetSpecialistsNotificationCount(): void {
    this.getSpecialistsNotificationCountHandler$.unsubscribe();
  }

  public getSpecialist$(): Observable<ISpecialist | null> {
    return this._specialistState.getSpecialist$();
  }

  public setSpecialist(specialist: ISpecialist | null): void {
    this._specialistState.setSpecialist(specialist);
  }

  public setSelectedSpecialistByUuid(specialistUuid: string, foundSpecialistsUuid: string): Observable<ISpecialist> {
    return this._specialistService.getSpecialistCard(specialistUuid, foundSpecialistsUuid).pipe(
      filter((specialist) => !!specialist.specialist),
      map((specialist) => specialist.specialist),
      tap((specialist) => {
        this._specialistState.setSpecialist(specialist);
      })
    );
  }

  public getSelectedSpecialistByUuid(): Observable<ISpecialist | null> {
    return this._specialistState.getSpecialist$();
  }

  public deleteSelectedSpecialistByUuid(): void {
    this._specialistState.deleteSelectedSpecialistByUuid();
  }
}

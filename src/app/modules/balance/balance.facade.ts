import {Injectable} from "@angular/core";
import {BalanceService} from "./balance.service";
import {VacancyState} from "../vacancy/vacancy.state";
import {Observable} from "rxjs";
import {BalanceTariffInterface} from "../app/interfaces/balance-tariff.interface";
import {CompanyState} from "../company/company.state";
import {BalanceState} from "./balance.state";

@Injectable({
  providedIn: "root"
})
export class BalanceFacade {

  constructor(
    private readonly _balanceService: BalanceService,
    private readonly _vacancyState: VacancyState,
    private readonly _companyState: CompanyState,
    private readonly _balanceState: BalanceState
  ) {
  }

  public getAllVacancies(end: number) {
    this._balanceService.getAllVacancies(end).subscribe(vacanciesData => {
      this._vacancyState.setAllVacancies(vacanciesData);
    });
  }

  public getAllVacanciesFromSate() {
    return this._vacancyState.allVacancySubject;
  }


  public getAllBalanceTariff() {
    this._balanceService.getCompanyTariff().subscribe((balance) => {
      this._vacancyState.setCompanyBalance(balance);
    });
  }

  public getCompanyBalance(): Observable<BalanceTariffInterface[]> {
    return this._vacancyState.getCompanyBalance();
  }

  public deleteVacancy(uuid: string | undefined) {
    this._vacancyState.deleteVacancy(uuid);
    this._balanceService.deleteVacancy(uuid).subscribe(vacancy => {
    });
  }

  public balanceTariffCount(): void {
    this._companyState.getCompanyData$().subscribe((company) => {
      if (company.packageCount) {
        this._balanceState.setTariffCountUnChanged(company.packageCount);
      }
    });
  }

  public setSelectedContentReference(ref: string) {
    this._balanceState.setSelectedContentReference(ref);
  }

  public getSelectedContentReference(): Observable<string> {
    return this._balanceState.getSelectedContentReference();
  }

}

import {Injectable} from "@angular/core";
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import { IMyVacancyFilter } from "../../vacancy/interfaces/my-vacancy-filter.interface";
import { IAddVacancy } from "src/app/shared/interfaces/add-vacancy.interface";
import { IPaidList } from "src/app/shared/interfaces/paid-list.interface";
import { IBalanceTariff } from "src/app/shared/interfaces/balance-tariff.interface";
import { StringOrNumberType } from "src/app/shared/interfaces/searchable-select-data.interface";


@Injectable({
  providedIn: "root"
})
export class BalanceService {
  private readonly companyVacancy = "company/vacancy";
  private readonly balanceTariff = "company/tariff";
  private readonly balanceOrders = "orders";

  constructor(private readonly _http: HttpClient) {
  }

  public getAllVacancies(end: number, searchParams?: IMyVacancyFilter): Observable<IAddVacancy> {
    const fullUrl = `${environment.url}/${this.companyVacancy}`;
    if (searchParams) {
      searchParams["take"] = 10;
      searchParams["skip"] = end;
      return this._http.get<IAddVacancy>(`${fullUrl}`, {params: {...searchParams}});
    }
    return this._http.get<IAddVacancy>(`${fullUrl}`,);
  }

  public  getVacanciesForSelection(searchParams: {status: string, payedStatus: string}) {
    const fullUrl = `${environment.url}/${this.companyVacancy}/${searchParams.payedStatus}/${searchParams.status}`;
    return this._http.get<{name: string, uuid: string}[]>(`${fullUrl}`);
  }

  getVacancieForUuid(uuid: StringOrNumberType): Observable<IAddVacancy> {
    const fullUrl = `${environment.url}/${this.companyVacancy}`;
    return this._http.get<IAddVacancy>(`${fullUrl}`, {params: {uuid}});
  }

  public deleteVacancy(uuid: string | undefined) {
    const fullUrl = `${environment.url}/${this.companyVacancy}/${uuid}`;
    return this._http.delete<IAddVacancy>(`${fullUrl}`);
  }

  public getCompanyTariff(): Observable<IBalanceTariff[]> {
    return this._http.get<IBalanceTariff[]>(`${environment.url}/${this.balanceTariff}`);
  }

  public getCompanyBalanceOrders(end: number, searchParams: IMyVacancyFilter): Observable<{result: IPaidList[], count: number}> {
    delete searchParams.payedStatus;
      searchParams["take"] = 10;
      searchParams["skip"] = end;
      return this._http.get<{result: IPaidList[], count: number}>(`${environment.url}/${this.balanceTariff}/${this.balanceOrders}`,
        {params: {...searchParams}}
      );
  }

  public buyTariff(tariffPackageUuid?: string, redirectPage?: string): Observable<{robokassa_url: string}> {
    localStorage.removeItem("tariffUuid");
    return this._http.get<{robokassa_url: string}>(`${environment.url}/company/find-robokassa-url/${tariffPackageUuid}`,
      {
        params: {
          redirectPage: redirectPage ?? (localStorage.getItem("vacancyUuid") ? "specialists" : "vacancies")
        }
      });
  }

  public buyNotPayedVacancy(vacancyUuid?: string): Observable<IAddVacancy> {
    return this._http.put<IAddVacancy>(`${environment.url}/company/vacancy/pay/${vacancyUuid}`, {});
  }
}

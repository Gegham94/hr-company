import {Injectable} from "@angular/core";
import {environment} from "../../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AddVacancyInterface} from "../app/interfaces/add-vacancy.interface";
import {Observable} from "rxjs";
import {MyVacancyFilterInterface} from "../vacancy/interfaces/my-vacancy-filter.interface";
import {StringOrNumber} from "../app/interfaces/searchable-select-data.interface";
import {BalanceTariffInterface} from "../app/interfaces/balance-tariff.interface";


@Injectable({
  providedIn: "root"
})
export class BalanceService {
  private readonly companyVacancy = "company/vacancy";
  private readonly balanceTariff = "company/tariff";
  private readonly balanceOrders = "orders";

  constructor(private readonly _http: HttpClient) {
  }

  public getAllVacancies(end: number, searchParams?: MyVacancyFilterInterface): Observable<AddVacancyInterface> {
    const fullUrl = `${environment.url}/${this.companyVacancy}`;
    if (searchParams) {
      searchParams["take"] = 10;
      searchParams["skip"] = end;
      return this._http.get<AddVacancyInterface>(`${fullUrl}`, {params: {...searchParams}});
    }
    return this._http.get<AddVacancyInterface>(`${fullUrl}`,);
  }

  public  getVacanciesForSelection(searchParams: {status: string, payedStatus: string}) {
    const fullUrl = `${environment.url}/${this.companyVacancy}/${searchParams.payedStatus}/${searchParams.status}`;
    return this._http.get<{name: string, uuid: string}[]>(`${fullUrl}`);
  }

  getVacancieForUuid(uuid: StringOrNumber): Observable<AddVacancyInterface> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append("uuid", uuid);
    const fullUrl = `${environment.url}/${this.companyVacancy}`;
    return this._http.get<AddVacancyInterface>(`${fullUrl}`, {params: queryParams});
  }

  public deleteVacancy(uuid: string | undefined) {
    const fullUrl = `${environment.url}/${this.companyVacancy}/${uuid}`;
    return this._http.delete<AddVacancyInterface>(`${fullUrl}`);
  }

  public getCompanyTariff(): Observable<BalanceTariffInterface[]> {
    return this._http.get<BalanceTariffInterface[]>(`${environment.url}/${this.balanceTariff}`);
  }

  public getCompanyBalanceOrders(end: number, searchParams: MyVacancyFilterInterface): Observable<any> {
    delete searchParams.payedStatus;
      searchParams["take"] = 10;
      searchParams["skip"] = end;
      return this._http.get<any>(`${environment.url}/${this.balanceTariff}/${this.balanceOrders}`,
        {params: {...searchParams}}
      );
  }

  public buyTariff(tariffPackageUuid?: string, redirectPage?: string): Observable<any> {
    localStorage.removeItem("tariffUuid");
    return this._http.get<any>(`${environment.url}/company/find-robokassa-url/${tariffPackageUuid}`,
      {
        params: {
          redirectPage: redirectPage ?? (localStorage.getItem("vacancyUuid") ? "specialists" : "vacancies")
        }
      });
  }

  public buyNotPayedVacancy(vacancyUuid?: string): Observable<any> {
    return this._http.put<any>(`${environment.url}/company/vacancy/pay/${vacancyUuid}`, {});
  }

}

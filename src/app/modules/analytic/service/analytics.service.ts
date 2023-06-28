import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { IAnalyticData } from "../interfaces/vacancy-analytics.interface";
import { HttpClient } from "@angular/common/http";
import { StringOrNumberType } from "src/app/shared/interfaces/searchable-select-data.interface";
import { IAddVacancy } from "src/app/shared/interfaces/add-vacancy.interface";

@Injectable({
  providedIn: "root",
})
export class AnalyticsService {
  constructor(public readonly _http: HttpClient) {}

  public getVacancyAnalytic(uuid: StringOrNumberType): Observable<IAnalyticData> {
    const fullUrl = `${environment.analytic}/analytic`;
    return this._http.get<IAnalyticData>(fullUrl, { params: { type: "vacancy", vacancyUuid: uuid } });
  }

  public getAllAnalytic(isArchived: boolean = false): Observable<IAnalyticData> {
    const fullUrl = `${environment.analytic}/analytic`;
    return this._http.get<IAnalyticData>(fullUrl, { params: { type: "company", archived: isArchived } });
  }

  public getVacancyByUuid(vacancyUuId: StringOrNumberType): Observable<IAddVacancy> {
    const fullUrl = `${environment.url}/company/vacancy?uuid=${vacancyUuId}`;
    return this._http.get<IAddVacancy>(fullUrl);
  }
}

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { environment } from "../../../../environments/environment";
import { IAddVacancy } from "../../../shared/interfaces/add-vacancy.interface";
import {
  IFilterRecourseLocationCities,
  IFilterRecourseLocationCountries,
  IFilterRecourseProgrammingFrameworks,
  IFilterRecourseProgrammingLanguages,
} from "../interfaces/filter-recourse.interface";
import { ISearchableSelectData, StringOrNumberType } from "../../../shared/interfaces/searchable-select-data.interface";
import { employmentTypes, languages, programmingLevels, workplace } from "../mock";
import { Specialist } from "../../specialists/interfaces/specialist.interface";
import { ObjectType } from "../../../shared/types/object.type";
import { IGetQuestions, ISendLanguages } from "../interfaces/questions.interface";
import { IAnalyticData } from "../../analytic/interfaces/vacancy-analytics.interface";

@Injectable({
  providedIn: "root",
})
export class VacancyService {
  private readonly save_vacancy = "company/vacancy";

  private readonly get_questions = "company/vacancy/questions/pdf";

  private readonly search_specialist = "search/specialist/parse";

  private readonly search_specialist_for_company = "search/specialist-for-company";

  private readonly filter_resource_url = `${environment.filterRecourseUrl}/filter-resource`;

  constructor(public http: HttpClient) {}

  public saveVacancy(vacancy: IAddVacancy): Observable<IAddVacancy> {
    const fullUrl = `${environment.url}/${this.save_vacancy}`;
    return this.http.post<IAddVacancy>(fullUrl, { ...vacancy });
  }

  public getVacancyAnalytic(uuid: StringOrNumberType): Observable<IAnalyticData> {
    const fullUrl = `${environment.analytic}/analytic`;
    return this.http.get<IAnalyticData>(fullUrl, { params: { type: "vacancy", vacancyUuid: uuid } });
  }

  public getAllAnalytic(isArchived: boolean = false): Observable<IAnalyticData> {
    const fullUrl = `${environment.analytic}/analytic`;
    return this.http.get<IAnalyticData>(fullUrl, { params: { type: "company", archived: isArchived } });
  }

  public updateVacancy(vacancy: IAddVacancy): Observable<boolean> {
    const vacancyId = vacancy.vacancyId;
    delete vacancy.vacancyId;
    const fullUrl = `${environment.url}/company/vacancy/${vacancyId}`;
    return this.http.put<boolean>(fullUrl, { ...vacancy });
  }

  public getVacancy(vacancyUuId: StringOrNumberType): Observable<IAddVacancy> {
    const fullUrl = `${environment.url}/${this.save_vacancy}?uuid=${vacancyUuId}`;
    return this.http.get<IAddVacancy>(fullUrl);
  }

  public getVacanciesBySearchCriteria(formData: IAddVacancy): Observable<Specialist> {
    const fullUrl = `${environment.searchUrl}/${this.search_specialist}?vacancyUuid=${formData.uuid}`;
    // TODO:

    return this.http.get<Specialist>(fullUrl, {
      params: {
        vacancy: formData.name,
        language: formData.searchedSettings.nativeLanguages.join(","),
        // workspace: formData.searchedSettings.wayOfWorking,
        programmingLanguagesAndFrameworks: `${formData.searchedSettings.programmingLanguages},${formData.searchedSettings.programmingFrameworks}`,
        city: formData.searchedSettings.city,
        country: formData.searchedSettings.country,
      },
    });
  }

  public getLanguages$(): Observable<ISearchableSelectData[]> {
    return of(languages);
  }

  public getEmploymentTypes$(): Observable<ISearchableSelectData[]> {
    return of(employmentTypes);
  }

  public getProgrammingLevels$(): Observable<ISearchableSelectData[]> {
    return of(programmingLevels);
  }

  public getWorkplace$(): Observable<ISearchableSelectData[]> {
    return of(workplace);
  }

  public getFilterRecourseProgrammingLanguagesRequest$(
    params: ObjectType
  ): Observable<IFilterRecourseProgrammingLanguages> {
    return this.http.get<IFilterRecourseProgrammingLanguages>(`${this.filter_resource_url}/programming/languages`, {
      params: params,
    });
  }

  public getFilterRecourseLocationCountriesRequest$(params: ObjectType): Observable<IFilterRecourseLocationCountries> {
    return this.http.get<IFilterRecourseLocationCountries>(`${this.filter_resource_url}/location/countries`, {
      params: params,
    });
  }

  public getFilterRecourseProgrammingFrameworksRequest$(
    params: ObjectType
  ): Observable<IFilterRecourseProgrammingFrameworks> {
    return this.http.get<IFilterRecourseProgrammingFrameworks>(`${this.filter_resource_url}/programming/frameworks`, {
      params: params,
    });
  }

  public getFilterRecourseLocationCitiesRequest$(params: ObjectType): Observable<IFilterRecourseLocationCities> {
    return this.http.get<IFilterRecourseLocationCities>(`${this.filter_resource_url}/location/cities`, {
      params: params,
    });
  }

  public getQuestionsList(body: ISendLanguages): Observable<IGetQuestions[]> {
    const fullUrl = `${environment.url}/${this.get_questions}`;
    return this.http.post<IGetQuestions[]>(fullUrl, { ...body });
  }
}

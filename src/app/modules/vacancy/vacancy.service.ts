import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {environment} from "../../../environments/environment";
import {AddVacancyInterface} from "../app/interfaces/add-vacancy.interface";
import {
  FilterRecourseLocationCities,
  FilterRecourseLocationCountries, FilterRecourseProgrammingFrameworks,
  FilterRecourseProgrammingLanguages
} from "./interfaces/filter-recourse.interface";
import {SearchableSelectDataInterface, StringOrNumber} from "../app/interfaces/searchable-select-data.interface";
import {employmentTypes, languages, programmingLevels, workplace} from "./mock";
import {FilteredSpecialistsListRequest, Specialist} from "../specialists/interfaces/specialist.interface";
import {SpecialistFilterInterface} from "../specialists/interfaces/specialist-filter-interface";
import {AnalyticData} from "../app/interfaces/vacancy-statistic.interface";
import {SearchParams} from "./interfaces/search-params.interface";
import {ObjectType} from "../../shared-modules/types/object.type";

@Injectable({
  providedIn: "root"
})
export class VacancyService {

  private readonly save_vacancy = "company/vacancy";

  private readonly search_specialist = "search/specialist/parse";

  private readonly search_specialist_for_company = "search/specialist-for-company";

  private readonly filter_resource_url = `${environment.filterRecourseUrl}/filter-resource`;

  constructor(public http: HttpClient) {
  }

  public saveVacancy(vacancy: AddVacancyInterface): Observable<AddVacancyInterface> {
    const fullUrl = `${environment.url}/${this.save_vacancy}`;
    return this.http.post<AddVacancyInterface>(fullUrl, {...vacancy});
  }

  public getVacancyAnalytic(uuid: StringOrNumber): Observable<AnalyticData> {
    const fullUrl = `${environment.analytic}/analytic`;
    return this.http.get<AnalyticData>(fullUrl, {params: {type: "vacancy", vacancyUuid: uuid}});
  }

  public getAllAnalytic(isArchived: boolean = false): Observable<AnalyticData> {
    const fullUrl = `${environment.analytic}/analytic`;
    return this.http.get<AnalyticData>(fullUrl, {params: {type: "company", archived: isArchived}});
  }

  public updateVacancy(vacancy: AddVacancyInterface): Observable<boolean> {
    const vacancyId = vacancy.vacancyId;
    delete vacancy.vacancyId;
    const fullUrl = `${environment.url}/company/vacancy/${vacancyId}`;
    return this.http.put<boolean>(fullUrl, {...vacancy});
  }

  public getVacancy(vacancyUuId: StringOrNumber): Observable<AddVacancyInterface> {
    const fullUrl = `${environment.url}/${this.save_vacancy}?uuid=${vacancyUuId}`;
    return this.http.get<AddVacancyInterface>(fullUrl);
  }

  public getFilteredSpecialistList(start: number, searchParams: SpecialistFilterInterface):
    Observable<FilteredSpecialistsListRequest> {
    const fullUrl = `${environment.searchUrl}/${this.search_specialist_for_company}`;
    searchParams["take"] = 0;
    searchParams["skip"] = start;
    return this.http.get<FilteredSpecialistsListRequest>(`${fullUrl}`, {params: {...searchParams}});
  }

  public getVacanciesBySearchCriteria(formData: AddVacancyInterface): Observable<Specialist> {
    const fullUrl = `${environment.searchUrl}/${this.search_specialist}?vacancyUuid=${formData.uuid}`;
    // TODO:

    return this.http.get<Specialist>(fullUrl, {
      params: {
        vacancy: formData.name,
        language: formData.searchedSettings.nativeLanguages.join(","),
        // workspace: formData.searchedSettings.wayOfWorking,
        programmingLanguagesAndFrameworks: `${formData.searchedSettings.programmingLanguages},${formData.searchedSettings.programmingFrameworks}`,
        city: formData.searchedSettings.city,
        country: formData.searchedSettings.country
      }
    });
  }

  public getLanguages$(): Observable<SearchableSelectDataInterface[]> {
    return of(languages);
  }

  public getEmploymentTypes$(): Observable<SearchableSelectDataInterface[]> {
    return of(employmentTypes);
  }

  public getProgrammingLevels$(): Observable<SearchableSelectDataInterface[]> {
    return of(programmingLevels);
  }

  public getWorkplace$(): Observable<SearchableSelectDataInterface[]> {
    return of(workplace);
  }

  public getFilterRecourseProgrammingLanguagesRequest$(params: ObjectType):
    Observable<FilterRecourseProgrammingLanguages> {
    return this.http.get<FilterRecourseProgrammingLanguages>(`${this.filter_resource_url}/programming/languages`,
      {params: params});
  }

  public getFilterRecourseLocationCountriesRequest$(params: ObjectType): Observable<FilterRecourseLocationCountries> {
    return this.http.get<FilterRecourseLocationCountries>(`${this.filter_resource_url}/location/countries`,
      {params: params});
  }

  public getFilterRecourseProgrammingFrameworksRequest$(params: ObjectType)
    : Observable<FilterRecourseProgrammingFrameworks> {
    return this.http.get<FilterRecourseProgrammingFrameworks>(`${this.filter_resource_url}/programming/frameworks`, {
      params: params
    });
  }

  public getFilterRecourseLocationCitiesRequest$(params: ObjectType): Observable<FilterRecourseLocationCities> {
    return this.http.get<FilterRecourseLocationCities>(`${this.filter_resource_url}/location/cities`, {
      params: params
    });
  }
}

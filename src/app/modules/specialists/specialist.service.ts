import {Injectable} from "@angular/core";
import {SpecialistFilterInterface} from "./interfaces/specialist-filter-interface";
import {FilteredSpecialistsListRequest} from "./interfaces/specialist.interface";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {SpecialistTestInterface} from "./interface/specialist-test.interface";

@Injectable({
  providedIn: "root"
})
export class SpecialistService {

  constructor(public http: HttpClient) {
  }

  private readonly search_specialist_for_company = "search/specialist-for-company";
  private readonly recruiterSpecialist = "recruiter/specialist";
  private readonly specialistsCount = "search/specialist-for-company";

  public getFilteredSpecialistList(start: number, searchParams: SpecialistFilterInterface):
    Observable<FilteredSpecialistsListRequest> {
    const fullUrl = `${environment.searchUrl}/${this.search_specialist_for_company}`;
    searchParams["take"] = 12;
    searchParams["skip"] = start;
    return this.http.get<FilteredSpecialistsListRequest>(`${fullUrl}`, {params: {...searchParams}});
  }

  public getSpecialistCard(uuid: string, foundSpecialistUuid?: string): Observable<SpecialistTestInterface> {
    let fullUrl = "";
    if (foundSpecialistUuid) {
      fullUrl = `${environment.recruiter}/${this.recruiterSpecialist}/${uuid}?foundSpecialistUuid=${foundSpecialistUuid}`;
    } else {
      fullUrl = `${environment.recruiter}/${this.recruiterSpecialist}/${uuid}`;
    }
    return this.http.get<SpecialistTestInterface>(`${fullUrl}`);
  }

  public getSpecialistsNotificationCount(): Observable<{ count: number }> {
    const fullUrl = `${environment.searchUrl}/${this.specialistsCount}/new-count`;
    return this.http.get<{ count: number }>(`${fullUrl}`);
  }

  public setSpecialistsNotificationCount(uuid: string): Observable<number> {
    const fullUrl = `${environment.searchUrl}/${this.search_specialist_for_company}/remove-new`;
    return this.http.put<number>(`${fullUrl}`, {uuids: [uuid]});
  }

  public hideOtherSpecialist(specialistUuid: string) {
    const fullUrl = `${environment.url}/${this.search_specialist_for_company}/${specialistUuid}`;
    return this.http.get(`${fullUrl}`);
  }

  public updateFavorites(uuid: string, isFavorite: boolean): Observable<{ data: string }> {
    const fullUrl = `${environment.url}/favorite`;
    return this.http.put<{ data: string }>(`${fullUrl}`, {
      uuid,
      isFavorite
    });
  }
}

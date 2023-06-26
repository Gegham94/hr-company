import {Injectable} from "@angular/core";
import {environment} from "../../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CompanyInterface} from "../app/interfaces/company.interface";
import {Observable} from "rxjs";
import {ObjectType} from "../../shared-modules/types/object.type";
import {CompanyInnInterface} from "../app/interfaces/company-inn.interface";
import {NotificationItemInfo} from "../header/interfaces/notifications.interface";


@Injectable({
  providedIn: "root"
})
export class CompanyService {
  private readonly company = "company";
  private readonly updateDeadlineDate = "company/vacancy";
  private readonly company_logo = "company/logo";
  private readonly company_inn = "company/search/by-inn";
  private readonly robot_helper = "company/change-robot-helper-hidden";

  constructor(private readonly _http: HttpClient) {
  }

  public getCompanyData(): Observable<CompanyInterface> {
    const fullUrl = `${environment.url}/${this.company}`;
    return this._http.get<CompanyInterface>(fullUrl);
  }

  public updateCompany(companyData: CompanyInterface): Observable<CompanyInterface> {
    const fullUrl = `${environment.url}/${this.company}`;
    return this._http.put<CompanyInterface>(fullUrl, {...companyData});
  }

  public updateCompanyLogo(logo: File, uuid: string): Observable<CompanyInterface> {
    const fullUrl = `${environment.url}/${this.company_logo}`;
    const formData: FormData = new FormData();
    formData.append("logo", logo, logo.name);
    const headers = new HttpHeaders();
    return this._http.post<CompanyInterface>(fullUrl, formData, {headers: headers, params: {uuid: uuid}});
  }

  public updateCurrentPageRobot(uuid: string): Observable<ObjectType> {
    const fullUrl = `${environment.url}/${this.robot_helper}/${uuid}`;
    return this._http.put<ObjectType>(fullUrl, {hidden: "true"});
  }

  public getCompanyInn(inn: string): Observable<CompanyInnInterface> {
    const fullUrl = `${environment.url}/${this.company_inn}`;
    return this._http.get<CompanyInnInterface>(fullUrl, {params: {query: inn}});
  }

  public changeCompanyVacancyDeadlineDate(updatedVacancyDate: NotificationItemInfo) {
    const fullUrl = `${environment.url}/${this.updateDeadlineDate}/${updatedVacancyDate.uuid}`;
    return this._http.put(fullUrl, {
      deadlineDate: updatedVacancyDate.deadlineDate,
      notificationUuid: updatedVacancyDate.notificationUuid,
      notificationStatus: updatedVacancyDate.notificationStatus
    });
  }

}

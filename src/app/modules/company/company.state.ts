import { Injectable } from "@angular/core";
import { CompanyInterface } from "../app/interfaces/company.interface";
import { BehaviorSubject, Observable, of } from "rxjs";
import { environment } from "../../../environments/environment";
import { Specialist } from "../specialists/interfaces/specialist.interface";

@Injectable({
  providedIn: "root",
})
export class CompanyState {
  private company$: BehaviorSubject<CompanyInterface> =
    new BehaviorSubject<CompanyInterface>({});
  private logo$: BehaviorSubject<string> = new BehaviorSubject<string>("");

  public setCompanyData(company: CompanyInterface) {
    this.company$.next(company);
  }

  public getCompanyData$(): Observable<CompanyInterface> {
    return this.company$.asObservable();
  }

  public getCompanyLogo$(): Observable<string> {
    return this.logo$.value ? this.logo$.asObservable() : of("");
  }

  public setCompanyLogo$(logo: File | string): void {
    if (!logo) {
      return;
    }
    this.logo$.next(`${environment.url}/company/logo/${logo}`);
  }

  public removeCompanyData() {
    this.company$.next({});
  }

  public get companyData(): CompanyInterface {
    return this.company$.getValue();
  }

  public specialistData(uuid: string): Specialist {
    const specialistsData = this.companyData?.foundSpecialists;
    let specialist = {};
    for (const key in specialistsData) {
      if (specialistsData.hasOwnProperty(key)) {
        specialist = specialistsData[key].find(
          (s: { uuid: string }) => s.uuid === uuid
        );
      }
    }
    return <Specialist>specialist;
  }
}

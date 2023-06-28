import { Injectable } from "@angular/core";
import { ICompany } from "../../../shared/interfaces/company.interface";
import { BehaviorSubject, Observable, of } from "rxjs";
import { environment } from "../../../../environments/environment";
import { Specialist } from "../../specialists/interfaces/specialist.interface";
import { ICompanyInn } from "src/app/shared/interfaces/company-inn.interface";

@Injectable({
  providedIn: "root",
})
export class CompanyState {
  private company$: BehaviorSubject<ICompany> = new BehaviorSubject<ICompany>({});
  private logo$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private inn$: BehaviorSubject<ICompanyInn> = new BehaviorSubject<ICompanyInn>({result: []});

  public setCompanyData(company: ICompany) {
    this.company$.next(company);
  }

  public getCompanyData$(): Observable<ICompany> {
    return this.company$.asObservable();
  }

  public getCompanyData(): ICompany {
    return this.company$.value;
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

  public get companyData(): ICompany {
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

  public setInn$(innList: ICompanyInn): void {
    this.inn$.next(innList)
  }

  public getInn$(): Observable<ICompanyInn> {
      return this.inn$.asObservable();
    }
}

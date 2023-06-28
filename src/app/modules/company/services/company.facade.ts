import { Injectable } from "@angular/core";
import { CompanyService } from "./company.service";
import { ICompany, IHelper } from "../../../shared/interfaces/company.interface";
import { catchError, map, Observable, of, switchMap, tap } from "rxjs";
import { CompanyState } from "./company.state";
import { environment } from "../../../../environments/environment";
import { ObjectType } from "../../../shared/types/object.type";
import { ShowLoaderService } from "../../../shared/services/show-loader.service";
import { LocalStorageService } from "../../../shared/services/local-storage.service";
import { NavigationButton } from "../../../shared/interfaces/navigateButton.interface";
import { NavigateButtonState } from "../../../ui-kit/navigate-button/navigate-button.state";
import { NavigateButtonFacade } from "../../../ui-kit/navigate-button/navigate-button.facade";
import { ICompanyInn } from "src/app/shared/interfaces/company-inn.interface";
import { ISearchableSelectData } from "src/app/shared/interfaces/searchable-select-data.interface";

@Injectable({
  providedIn: "root",
})
export class CompanyFacade {
  constructor(
    private readonly _companyService: CompanyService,
    private readonly _companyState: CompanyState,
    private readonly _localStorage: LocalStorageService,
    private readonly _navigationButtonState: NavigateButtonState,
    private readonly _navigationButtonFacade: NavigateButtonFacade,
    private readonly _showLoaderService: ShowLoaderService
  ) {}

  public setCompanyData$(): Observable<ICompany> {
    return this._companyService.getCompanyData().pipe(
      map((company) => {
        this._showLoaderService.isNavButtonCreated$.next(false);
        if (company && company.helper) {
          this.generateNavigationButtons(company.helper);
        }
        this._companyState.setCompanyData(company);
        this._localStorage.setItem("company", JSON.stringify(company));
        return company;
      })
    );
  }

  public getCompanyLogo(logo: File | string): string {
    return `${environment.url}/company/logo/${logo}`;
  }

  public getCompanyData$(): Observable<ICompany> {
    return this._companyState.getCompanyData$();
  }

  public getCompanyData(): ICompany {
    return this._companyState.getCompanyData();
  }

  public setCompanyData(company: ICompany): void {
    this._companyState.setCompanyData(company);
    this._localStorage.setItem("company", JSON.stringify(company));
  }

  public getCompanyLogo$(): Observable<string> {
    return this._companyState.getCompanyLogo$();
  }

  public setCompanyLogo$(logo: string | File): void {
    this._companyState.setCompanyLogo$(logo);
  }

  public removeCompanyData(): void {
    this._companyState.removeCompanyData();
  }

  public updateCompany$(company: ICompany): Observable<ICompany> {
    const data = {
      phone: company.phone,
      name: company.name,
      email: company.email,
      address: company.address,
      city: company.city,
      country: company.country,
      description: company.description,
      webSiteLink: company.webSiteLink,
      inn: company.inn,
      ogrn: company.ogrn,
    };

    if (typeof company.logo !== "string" && company.logo && company.uuid) {
      return this._companyService.updateCompanyLogo(company.logo, company.uuid).pipe(
        catchError((err) => {
          return of(err);
        }),
        switchMap(() => {
          return this._companyService.updateCompany(data);
        })
      );
    }

    return this._companyService.updateCompany(data);
  }

  public updateCurrentPageRobot(uuid: string): Observable<ObjectType> {
    return this._companyService.updateCurrentPageRobot(uuid);
  }

  public setInn$(query: string): Observable<ISearchableSelectData[] | null> {
    return this._companyService.getCompanyInn(query).pipe(
      tap((innList: ICompanyInn) => this._companyState.setInn$(innList)),
      map((inn) => {
        if (inn.result.length === 0) {
          return null;
        }
        return inn.result.map((item, index) => ({
          id: index,
          value: item.inn,
          displayName: item.value,
          innItem: inn.result[index],
        }));
      })
    );
  }

  public generateNavigationButtons(helpers: IHelper[]): void {
    let navButtonsForDisplay: NavigationButton[] = [];
    helpers.forEach((helper) => {
      if (helper.link.includes("/isActive")) {
        const navButton = this._navigationButtonState.navigationButtons.find(
          (button) => button.link + "/isActive" === helper.link
        );
        if (navButton) {
          navButtonsForDisplay.push(new NavigationButton(navButton, helper));
        }
      }
    });
    navButtonsForDisplay = navButtonsForDisplay.sort((a, b) => a.id - b.id);
    navButtonsForDisplay.shift();
    this._navigationButtonFacade.setShowedNavigationsMenu$(navButtonsForDisplay);
  }
}

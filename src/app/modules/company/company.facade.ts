import {Injectable} from "@angular/core";
import {CompanyService} from "./company.service";
import {CompanyInterface, Helper} from "../app/interfaces/company.interface";
import {map, Observable, switchMap} from "rxjs";
import {CompanyState} from "./company.state";
import {environment} from "../../../environments/environment";
import {ObjectType} from "../../shared-modules/types/object.type";
import {ToastsService} from "../app/services/toasts.service";
import {ToastModel} from "../app/model/toast.model";
import {ShowLoaderService} from "../app/services/show-loader.service";
import {LocalStorageService} from "../app/services/local-storage.service";
import {HomeLayoutState} from "../home/home-layout/home-layout.state";
import {StatusTypeEnum} from "../app/constants/status-type.enum";
import {NavigationButton} from "../app/interfaces/navigateButton.interface";
import {NavigateButtonState} from "../../ui-kit/navigate-button/navigate-button.state";
import {NavigateButtonFacade} from "../../ui-kit/navigate-button/navigate-button.facade";

@Injectable({
  providedIn: "root"
})
export class CompanyFacade {

  constructor(
    private readonly _companyService: CompanyService,
    private readonly _companyState: CompanyState,
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly _toastService: ToastsService,
    private readonly _loader: ShowLoaderService,
    private readonly _localStorage: LocalStorageService,
    private readonly _navigationButtonState: NavigateButtonState,
    private readonly _navigationButtonFacade: NavigateButtonFacade,
    private readonly _showLoaderService: ShowLoaderService
  ) {
  }

  public setCompanyData$(): Observable<CompanyInterface> {
    return this._companyService.getCompanyData().pipe(
      map(company => {
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

  public getCompanyData$(): Observable<CompanyInterface> {
    return this._companyState.getCompanyData$();
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

  public updateCompany(company: CompanyInterface): Observable<CompanyInterface> {
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
      ogrn: company.ogrn
    };

    if ((typeof company.logo !== "string") && company.logo && company.uuid) {
      this._companyService.updateCompanyLogo(company.logo, company.uuid)
        .subscribe(()=> {
          this.setCompanyData$();
        });
    }

    return this._companyService.updateCompany(data);

  }

  public updateCurrentPageRobot(uuid: string): Observable<ObjectType> {
    return this._companyService.updateCurrentPageRobot(uuid);
  }

  private generateNavigationButtons(helpers: Helper[]): void {
    let navButtonsForDisplay: NavigationButton[] = [];
    helpers.forEach(helper => {
      if (helper.link.includes("/isActive")) {
        const navButton = this._navigationButtonState.navigationButtons.find(button => button.link + "/isActive" === helper.link);
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

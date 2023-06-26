import {Component, HostListener, Input} from "@angular/core";
import {ButtonTypeEnum} from "../app/constants/button-type.enum";
import {CompanyInterface} from "../app/interfaces/company.interface";
import {BehaviorSubject, Observable, of, switchMap} from "rxjs";
import {CompanyFacade} from "../company/company.facade";
import {Router} from "@angular/router";
import {AuthService} from "../auth/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {LocalStorageService} from "../app/services/local-storage.service";
import {HeaderFacade} from "./header.facade";
import {HeaderDropdownsEnum} from "./constants/header-dropdowns.enum";
import {HomeLayoutState} from "../home/home-layout/home-layout.state";
import {RoutesEnum} from "../app/constants/routes.enum";
import {NavigateButton} from "../home/home-layout/home-layout.interface";
import {HeaderTariffsEnum} from "./constants/header-tariffs.enum";

@Component({
  selector: "hr-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent {
  @Input("notification-count") notificationCountProps?: number;
  @Input("header-type") headerTypeProps!: string;
  public logo: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public isTariffInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public buttonType = ButtonTypeEnum;
  public isDropdownOpen$ = this._headerFacade.getStateDropdown$(HeaderDropdownsEnum.menu);
  public company$!: Observable<CompanyInterface>;
  public showLanguages = false;
  public isMenuOpen: boolean = false;
  public buttonsStatuses: NavigateButton[] = this._homeLayoutState.getButtonsStatuses();
  public readonly RoutesEnum = RoutesEnum;
  public readonly HeaderTariffsEnum = HeaderTariffsEnum;

  @HostListener("window:resize", ["$event"])
  onResize() {
    if (this.isMenuOpen) {
      this.isMenuOpen = !this.isMenuOpen;
      document.body.classList.remove("active");
    }
  }

  constructor(
    private readonly _companyFacade: CompanyFacade,
    private readonly _headerFacade: HeaderFacade,
    private readonly _router: Router,
    private readonly _authService: AuthService,
    private readonly _localStorageService: LocalStorageService,
    private readonly _homeLayoutState: HomeLayoutState,
    public readonly _translate: TranslateService,
  ) {
    // this._companyFacade.setCompanyData();
    // this.selectedLang = this._localStorageService.getItem("language") ?? defaultLang;
  }

  ngOnInit() {
    if (this.isLogged) {
      this.company$ = this._companyFacade.getCompanyData$();
      this.company$.pipe(switchMap((data: CompanyInterface) => {
          if (data.logo) {
            this._companyFacade.setCompanyLogo$(data.logo);
            return this._companyFacade.getCompanyLogo$();
          }
          return of("");
        })
      ).subscribe(logo => {
        this.logo.next(logo);
      });
    }
  }

  public logOut(): void {
    this._companyFacade.removeCompanyData();
    this._authService.logOut();
  }

  public openTariffPopup(event: Event) {
    this.isTariffInfo$.next(true);
    this.isMenuOpen = !this.isMenuOpen;
  }

  public navigate(link: string): void {
    this.isMenuOpenHandler();
    this._router.navigate([link]);
  }

  public isDisabled(route: string): boolean {
    return !this.buttonsStatuses.find(item => item.link === route + "/isActive")?.status ?? true;
  }

  public dropMenuToggle(newState?: boolean): void {
    this._headerFacade.resetDropdownsState(HeaderDropdownsEnum.menu, newState);
  }

  public get isLogged(): boolean {
    return !!(this._authService.getToken && this._authService.isTokenExpired && this._router.url !== "/signIn");
  }

  // public switchLang(index: number): void {
  //   this._translate.use(Languages[index]);
  //   this.selectedLang = Languages[index];
  //   this._localStorageService.setItem("language", Languages[index]);
  // }

  public isMenuOpenHandler(): void {
    this.buttonsStatuses = this._homeLayoutState.getButtonsStatuses();
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      document.body.classList.add("active");
    } else {
      document.body.classList.remove("active");
    }
  }

  public close(event: Event) {
    event.stopPropagation();
    this._headerFacade.resetDropdownsState(HeaderDropdownsEnum.menu, false);
  }

  public closePopup() {
    this.isTariffInfo$.next(false);
    this.isMenuOpen = !this.isMenuOpen;
  }
}

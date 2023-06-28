import { ChangeDetectionStrategy, Component, HostListener, Input, OnDestroy, OnInit } from "@angular/core";
import { BehaviorSubject, map, Observable, of, switchMap, takeUntil } from "rxjs";
import { Router } from "@angular/router";
import { HeaderFacade } from "./services/header.facade";
import { HeaderDropdownsEnum } from "./constants/header-dropdowns.enum";
import { HeaderTariffsEnum } from "./constants/header-tariffs.enum";
import { NavigateButtonFacade } from "../../ui-kit/navigate-button/navigate-button.facade";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { ICompany } from "src/app/shared/interfaces/company.interface";
import { RoutesEnum } from "src/app/shared/enum/routes.enum";
import { ScreenSizeType } from "src/app/shared/interfaces/screen-size.type";
import { ScreenSizeEnum } from "src/app/shared/enum/screen-size.enum";
import { CompanyFacade } from "../company/services/company.facade";
import { AuthService } from "../auth/service/auth.service";
import { ScreenSizeService } from "src/app/shared/services/screen-size.service";

@Component({
  selector: "hr-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent extends Unsubscribe implements OnInit, OnDestroy {
  @Input("notification-count") notificationCountProps?: number;
  @Input("header-type") headerTypeProps!: string;

  public logo: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public isDropdownOpen$ = this._headerFacade.getStateDropdown$(HeaderDropdownsEnum.menu);
  public company$!: Observable<ICompany>;
  public isMenuOpen: boolean = false;
  public readonly RoutesEnum = RoutesEnum;
  public readonly HeaderTariffsEnum = HeaderTariffsEnum;

  private closeDrawer: BehaviorSubject<"open" | "close" | null> = new BehaviorSubject<"open" | "close" | null>(null);
  private screenSizeType: BehaviorSubject<ScreenSizeType> = new BehaviorSubject<ScreenSizeType>(ScreenSizeEnum.DESKTOP);

  @HostListener("window:resize", ["$event"])
  onResize() {
    if (this.isMenuOpen) {
      this.isMenuOpen = !this.isMenuOpen;
    }
  }

  public get isLogged(): boolean {
    return !!(this._authService.getToken && this._authService.isTokenExpired && this._router.url !== "/signIn");
  }

  public get drawerWidth(): number {
    return this.screenSizeType.value == ScreenSizeEnum.EXTRA_SMALL ? 100 : 70;
  }

  constructor(
    private readonly _companyFacade: CompanyFacade,
    private readonly _headerFacade: HeaderFacade,
    private readonly _router: Router,
    private readonly _authService: AuthService,
    private readonly _navigateButtonFacade: NavigateButtonFacade,
    private readonly _screenSizeService: ScreenSizeService
  ) {
    super();
  }

  ngOnInit() {
    if (this.isLogged) {
      this.company$ = this._companyFacade.getCompanyData$();
      this.company$
        .pipe(
          takeUntil(this.ngUnsubscribe),
          switchMap((data: ICompany) => {
            if (data.logo) {
              this._companyFacade.setCompanyLogo$(data.logo);
              return this._companyFacade.getCompanyLogo$();
            }
            return of("");
          })
        )
        .subscribe((logo) => {
          this.logo.next(logo);
        });

      this.screenSizeType.next(this._screenSizeService.calcScreenSize);
      this._screenSizeService.screenSize$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((type: ScreenSizeType) => {
        this.screenSizeType.next(type);
      });
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  public logOut(): void {
    this._authService.logOut();
    this._headerFacade.setStateDropdown$(HeaderDropdownsEnum.menu, false)
  }

  public openTariffPopup() {
    this._headerFacade.tarifModalState.next(null);
    this.isMenuOpen = false;
  }

  public navigate(link: string): void {
    this.isMenuOpen = false;
    this.closeDrawer.next("close");
    this._router.navigate([link]);
  }

  public isDisabled(route: string): Observable<boolean> {
    return this._navigateButtonFacade.getShowedNavigationsMenu$().pipe(
      map((data) => {
        return !(data?.find((item) => item.link === route)?.statusType === "default");
      })
    );
  }

  public dropMenuToggle(newState?: boolean): void {
    this._headerFacade.resetDropdownsState(HeaderDropdownsEnum.menu, newState);
  }

  public close(): void {
    this.isMenuOpen = false;
    this.closeDrawer.next("close");
  }
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from "@angular/core";
import "hammerjs";
import { BehaviorSubject, distinctUntilChanged, Observable, of } from "rxjs";
import { Unsubscribe } from "../../shared/unsubscriber/unsubscribe";
import { ICompany } from "../../shared/interfaces/company.interface";
import { LocalStorageService } from "../../shared/services/local-storage.service";
import { RoutesEnum } from "../../shared/enum/routes.enum";
import { HomeLayoutFacade } from "../../modules/home/home-layout/home-layout.facade";
import { RobotHelperService } from "../../shared/services/robot-helper.service";
import { RobotHelper } from "../../shared/interfaces/robot-helper.interface";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { ScreenSizeType } from "src/app/shared/interfaces/screen-size.type";
import {
  robotBgOpacityAnimation,
  robotBlockInfoAnimation,
  robotFadeInOutAnimation,
  robotToastAnimation,
} from "./robot.animations";
import { BalanceFacade } from "src/app/modules/balance/services/balance.facade";
import { ScreenSizeService } from "src/app/shared/services/screen-size.service";

@Component({
  selector: "hr-robot",
  templateUrl: "./robot.component.html",
  styleUrls: ["./robot.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    robotFadeInOutAnimation,
    robotBgOpacityAnimation,
    robotBlockInfoAnimation,
    robotToastAnimation,
  ],
})
export class RobotComponent extends Unsubscribe {
  public company$: Observable<ICompany> = of(
    JSON.parse(this._localStorage.getItem("company"))
  );
  public robotSettings$: Observable<RobotHelper> =
    this._robotHelperService.getRobotSettings();

  public isRobotLoaded$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public isPolygonLoaded$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public readonly Routes = RoutesEnum;
  public state: string = "closed";
  public infoState: string = "closed";
  public isRobotOpen$ = this._robotHelperService
    .getIsRobotOpen()
    .subscribe(() => {
      this.state = "open";
    });

  public helperInfo: BehaviorSubject<SafeHtml[]> = new BehaviorSubject<
    SafeHtml[]
  >([]);
  public counter: number = 0;

  get screenSizeType(): ScreenSizeType {
    return this.screenSize.calcScreenSize;
  }

  constructor(
    private readonly _homeLayoutFacade: HomeLayoutFacade,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _localStorage: LocalStorageService,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _balanceFacade: BalanceFacade,
    private readonly sanitizer: DomSanitizer,
    private readonly screenSize: ScreenSizeService
  ) {
    super();
    setTimeout(() => {
      this.infoState = "open";
      this._cdr.detectChanges();
    }, 700);

    this.getContent();
  }

  public getContent(): void {
    this.robotSettings$.pipe(distinctUntilChanged()).subscribe((data) => {
      if (data) {
        if (typeof data?.content === "string") {
          this.helperInfo.next([
            this.sanitizer.bypassSecurityTrustHtml(data.content),
          ]);
        } else {
          const convertedTrustHtmlArr = data.content.map((item) =>
            this.sanitizer.bypassSecurityTrustHtml(item)
          );
          this.helperInfo.next(convertedTrustHtmlArr);
        }
      }
    });
  }

  public scrollToCards() {
    this._balanceFacade.setSelectedContentReference("cards");
  }

  public scrollToPaymentHistory() {
    this._balanceFacade.setSelectedContentReference("paymentHistory");
  }

  public scrollToUnpaidVacancies() {
    this._balanceFacade.setSelectedContentReference("unpaidVacancies");
  }

  public isRobotLoaded() {
    this.isRobotLoaded$.next(true);
  }

  public isPolygonLoaded() {
    this.isPolygonLoaded$.next(true);
  }

  public isReadyImages() {
    return this.isRobotLoaded$.value && this.isPolygonLoaded$.value;
  }

  public close() {
    this.state = "closed";
    this.infoState = "closed";
    setTimeout(() => {
      this._homeLayoutFacade.close();
    }, 500);
  }

  public checkForValidSwipe(swipeEvent: any) {
    if (swipeEvent.deltaY >= 80) {
      this.state = "closed";
      setTimeout(() => {
        this.close();
      }, 500);
    }
  }
}

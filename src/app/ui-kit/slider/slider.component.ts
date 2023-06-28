import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2, TemplateRef,
} from "@angular/core";
import {SafeHtml} from "@angular/platform-browser";
import {BalanceFacade} from "../../modules/balance/services/balance.facade";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {ChatFacade} from "../../modules/chat/chat.facade";
import {ObjectType} from "../../shared/types/object.type";
import {Router} from "@angular/router";
import {Observable, of, switchMap} from "rxjs";
import {ICompany} from "../../shared/interfaces/company.interface";
import {LocalStorageService} from "../../shared/services/local-storage.service";
import {RoutesEnum} from "../../shared/enum/routes.enum";
import {RobotHelperService} from "../../shared/services/robot-helper.service";
import {NavigateButtonFacade} from "../navigate-button/navigate-button.facade";
import {CompanyFacade} from "../../modules/company/services/company.facade";

@Component({
  selector: "hr-slider",
  templateUrl: "./slider.component.html",
  styleUrls: ["./slider.component.scss"],
  animations: [
    trigger("fade", [
      state("void", style({opacity: 0})),
      transition("void <=> *", [animate("1s ease-in-out")])
    ]),
  ]
})
export class SliderComponent {
  @Input() public helperInfo!: SafeHtml[] | TemplateRef<any>[];
  @Input() public specialist!: ObjectType;
  @Input() public isTemplateRef: boolean = false;
  /** Если нужно, чтобы кнопки слайдера были под контентом, передать true */
  @Input() public controlsUnder: boolean = false;
  /** Если нужно, чтобы контент был сцентрирован по вертикали, передать true*/
  @Input() public centerContent: boolean = false;
  @Output() public isOpenChat: EventEmitter<boolean> = new EventEmitter();
  @Output() public close: EventEmitter<boolean> = new EventEmitter();

  public counter: number = 0;
  public company$: Observable<ICompany> = this._companyFacade.getCompanyData$();
  public Routes = RoutesEnum;

  constructor(
    private readonly elementRef: ElementRef,
    private readonly renderer2: Renderer2,
    private readonly _balanceFacade: BalanceFacade,
    private readonly _chatFacade: ChatFacade,
    private readonly _router: Router,
    private readonly _localStorage: LocalStorageService,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _navigateButtonFacade: NavigateButtonFacade,
    private readonly _companyFacade: CompanyFacade,
  ) {
  }

  public next(): void {
    if (this.counter < this.helperInfo.length - 1) {
      this.counter += 1;
    }
    this.scrollToElement();
  }

  public prev(): void {
    if (this.counter >= 1) {
      this.counter = this.counter - 1;
    }
    this.scrollToElement();
  }


  private scrollToElement(): void {
    switch (this.counter) {
      case 0: {
        this.scrollToCards();
        break;
      }
      case 1: {
        this.scrollToUnpaidVacancies();
        break;
      }
      case 2: {
        this.scrollToPaymentHistory();
        break;
      }
      default: {
      }
    }
  }

  // tslint:disable-next-line:no-any
  public get templateRefs(): TemplateRef<any>[] {
    // tslint:disable-next-line:no-any
    return this.helperInfo as TemplateRef<any>[];
  }

  public ngAfterViewChecked(): void {
    if (this.elementRef.nativeElement.querySelector("#cards")) {
      this.elementRef.nativeElement
        .querySelector("#cards")
        .addEventListener("click", this.scrollToCards.bind(this));
    }

    if (this.elementRef.nativeElement.querySelector("#paymentHistory")) {
      this.elementRef.nativeElement
        .querySelector("#paymentHistory")
        .addEventListener("click", this.scrollToPaymentHistory.bind(this));
    }

    if (this.elementRef.nativeElement.querySelector("#unpaidVacancies")) {
      this.elementRef.nativeElement
        .querySelector("#unpaidVacancies")
        .addEventListener("click", this.scrollToUnpaidVacancies.bind(this));
    }

    if (this.elementRef.nativeElement.querySelector("#closeModal")) {
      this.elementRef.nativeElement
        .querySelector("#closeModal")
        .addEventListener("click", this.closeModal.bind(this));
    }

    if (this.elementRef.nativeElement.querySelector("#startChat")) {
      this.elementRef.nativeElement
        .querySelector("#startChat")
        .addEventListener("click", this.startChat.bind(this));
    }

    if (this.elementRef.nativeElement.querySelector("#payment")) {
      this.elementRef.nativeElement
        .querySelector("#payment")
        .addEventListener("click", this.payment.bind(this));
    }
  }

  public closeModal() {
    this.isOpenChat.emit(false);
  }

  public startChat() {
    this.isOpenChat.emit(true);
  }

  public payment() {
    this.company$.pipe(
      switchMap((company) => {
        const navigationBtns = this._navigateButtonFacade.getShowedNavigationsMenu();
        if (navigationBtns) {
          const currentBtnIndex = navigationBtns.findIndex(btn => btn.id === 6);
          if (currentBtnIndex > -1) {
            navigationBtns[currentBtnIndex].statusType = "default";
          }
          this._navigateButtonFacade.setShowedNavigationsMenu$(navigationBtns);
        }
        return of(company);
      }),
      switchMap((company: ICompany) => {
        const balancePageIndex = company.helper?.findIndex((data) =>
          data["link"] === this.Routes.balance + "/isActive") ?? -1;
        if (company?.helper && balancePageIndex >= 0) {
          company.helper[balancePageIndex]["hidden"] = true;
          this._localStorage.setItem("company", JSON.stringify(company));
          return this._companyFacade.updateCurrentPageRobot(company.helper[balancePageIndex]["uuid"]);
        }
        return of(null);
      }))
      .subscribe(() => {
        this.close.emit(true);
        this._router.navigate(["/balance"], {queryParams: {fromVacancy: true}});
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

}

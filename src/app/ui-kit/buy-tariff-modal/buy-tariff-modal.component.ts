import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Observable, of} from "rxjs";
import {CompanyState} from "../../modules/company/company.state";
import {VacancyFacade} from "../../modules/vacancy/vacancy.facade";
import {SpecialistFacade} from "../../modules/specialists/specialist.facade";
import {HomeLayoutState} from "../../modules/home/home-layout/home-layout.state";
import {Router} from "@angular/router";
import {RobotHelperService} from "../../modules/app/services/robot-helper.service";
import {LocalStorageService} from "../../modules/app/services/local-storage.service";
import {CompanyFacade} from "../../modules/company/company.facade";
import {BalanceState} from "../../modules/balance/balance.state";
import {Unsubscribe} from "../../shared-modules/unsubscriber/unsubscribe";
import {CompanyInterface} from "../../modules/app/interfaces/company.interface";

@Component({
  selector: "hr-buy-tariff-modal",
  templateUrl: "./buy-tariff-modal.component.html",
  styleUrls: ["./buy-tariff-modal.component.scss"]
})
export class BuyTariffModalComponent extends Unsubscribe implements OnInit {
  public paymentMessage!: string;
  public company$: Observable<CompanyInterface> = of(JSON.parse(this._localStorage.getItem("company")));
  @Input() isOpen: boolean = false;
  @Output() checkIsRobot: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private readonly _companyState: CompanyState,
    private readonly _vacancyFacade: VacancyFacade,
    private readonly _specialistFacade: SpecialistFacade,
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly _router: Router,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _localStorage: LocalStorageService,
    private readonly _companyFacade: CompanyFacade,
    private readonly _balanceState: BalanceState,
  ) {
    super();
  }

  ngOnInit() {
    if(this._router.url.includes("payment")) {
      const messageCodeConvert = window.atob(<string>BuyTariffModalComponent.getParameterByName("payment"));
      if (Boolean(messageCodeConvert)) {
        if (!!JSON.parse(messageCodeConvert)["success"]) {
          this._balanceState.setTariffBouth(true);
        } else {
          this._balanceState.setTariffBouth(false);
        }
        this.paymentMessage = BuyTariffModalComponent.b64DecodeUnicode(JSON.parse(messageCodeConvert).message);
      }
    }
  }

  public postponeModal(): void {
    this.isOpen = !this.isOpen;
    this.checkIsRobot.emit(true);
  }

  private static b64DecodeUnicode(str: string): string {
    return decodeURIComponent(str.split("").map((c) => {
      return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));
  }

  private static getParameterByName(name?: string, url = window.location.href): string | null {
    name = name?.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");

    const results = regex.exec(url);

    if (!results) {
      return null;
    }
    if (!results[2]) {
      return "";
    }
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
}

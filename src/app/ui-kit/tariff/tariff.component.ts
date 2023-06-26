import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {BehaviorSubject, Observable, tap} from "rxjs";
import {BalanceTariffInterface} from "../../modules/app/interfaces/balance-tariff.interface";
import {BalanceFacade} from "../../modules/balance/balance.facade";
import {BalanceService} from "../../modules/balance/balance.service";
import {BalanceInterface} from "../../modules/app/interfaces/balance.interface";
import {BalanceState} from "../../modules/balance/balance.state";
import {LocalStorageService} from "../../modules/app/services/local-storage.service";
import {HeaderTariffsEnum} from "../../modules/header/constants/header-tariffs.enum";
import {ButtonTypeEnum} from "../../modules/app/constants/button-type.enum";
import {Router} from "@angular/router";

export interface IPackageInfo {
  allActivePackages: number;
  stayedPackages: number;
  activeTariffsNames: string;
  activeTariffUuid: string;
}

@Component({
  selector: "hr-tariff",
  templateUrl: "./tariff.component.html",
  styleUrls: ["./tariff.component.scss"]
})
export class TariffComponent implements OnInit {
  @Input("isTariffInfo") isTariffInfo: boolean = false;
  public paymentMessage!: string;
  public isChooseModalOpen: boolean = false;
  public getBalanceTariff$: Observable<BalanceTariffInterface[]> = this._balanceFacade.getCompanyBalance();
  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public buttonTypesList = ButtonTypeEnum;

  public packageInfo$: BehaviorSubject<IPackageInfo> = new BehaviorSubject<IPackageInfo>({
    allActivePackages: 0,
    stayedPackages: 0,
    activeTariffsNames: "",
    activeTariffUuid: ""
  });

  public HeaderTariffsEnum = HeaderTariffsEnum;
  @Output() public close: EventEmitter<boolean> = new EventEmitter();

  constructor(private readonly _balanceFacade: BalanceFacade,
              private readonly _balanceState: BalanceState,
              private readonly _localStorageService: LocalStorageService,
              private readonly _router: Router,
              private readonly _cdr: ChangeDetectorRef,
              private readonly service: BalanceService) {
  }

  ngOnInit(): void {
    this._balanceFacade.getAllBalanceTariff();
    if (this.isTariffInfo) {
      this.isLoader$.next(true);
      this.getAllActivePackages();
      this.getStayedPackages();
    }
  }

  public navigateToBalance() {
    this.close.emit(true);
    this._router.navigateByUrl("/balance");
  }

  public getStayedPackages(): void {
    if (this._localStorageService.getItem("company")) {
      const company = JSON.parse(this._localStorageService.getItem("company"));
      this.packageInfo$.next({
          ...this.packageInfo$.value, ...{
            allActivePackages: 0,
            stayedPackages: company.packageCount,
            activeTariffUuid: company.activeTariffUuid
          }
        }
      );
    }
  }

  public getAllActivePackages(): void {
    this.getBalanceTariff$
      .pipe(
        tap((data) => {
          let sum = 0;
          let activeTariffs = "";
          data.forEach(item => {
            if (item.isActive) {
              sum += item.count;
              activeTariffs += item.name + ", ";
            }
          });
          this.packageInfo$.next({
            ...this.packageInfo$.value, ...{
              allActivePackages: sum,
              activeTariffsNames: activeTariffs.slice(0, activeTariffs.length - 2)
            }
          });
        })
      ).subscribe(() => {
      this.isLoader$.next(false);
      this._cdr.detectChanges();
    });
  }

  public buyTariff(event: BalanceInterface): void {
    if (!event?.isActive) {
      this.service.buyTariff(event?.uuid).subscribe((payment) => {
        window.location.replace(payment["robokassa_url"]);
      });
    }
  }
}

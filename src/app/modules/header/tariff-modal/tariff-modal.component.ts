import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { BehaviorSubject, Observable, switchMap, take, takeUntil, tap } from "rxjs";
import { BalanceFacade } from "../../balance/services/balance.facade";
import { Router } from "@angular/router";
import { HrModalService } from "../../modal/hr-modal.service";
import { DrawerState } from "src/app/ui-kit/drawer/drawer.state";
import { HeaderFacade } from "../services/header.facade";
import { IPackageInfo } from "../interfaces/package.interface";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { IBalanceTariff } from "src/app/shared/interfaces/balance-tariff.interface";
import { ButtonTypeEnum } from "src/app/shared/enum/button-type.enum";
import { ICompany } from "src/app/shared/interfaces/company.interface";
import { CompanyFacade } from "../../company/services/company.facade";

@Component({
  selector: "hr-tariff-modal",
  templateUrl: "./tariff-modal.component.html",
  styleUrls: ["./tariff-modal.component.scss"],
})
export class TariffModalComponent extends Unsubscribe implements OnInit, OnDestroy {
  @ViewChild("titleTpl") titleTpl!: TemplateRef<any>;
  @ViewChild("contentTpl") contentTpl!: TemplateRef<any>;

  public getBalanceTariff$: Observable<IBalanceTariff[]> = this._balanceFacade.getCompanyBalance();
  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public buttonTypesList = ButtonTypeEnum;

  public packageInfo$: BehaviorSubject<IPackageInfo> = new BehaviorSubject<IPackageInfo>({
    allActivePackages: 0,
    stayedPackages: 0,
    activeTariffsNames: "",
    activeTariffUuid: "",
  });

  constructor(
    private readonly _balanceFacade: BalanceFacade,
    private readonly _companyFacade: CompanyFacade,
    private readonly _headerFacade: HeaderFacade,
    private readonly _router: Router,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _modalService: HrModalService,
    private readonly _drawerState: DrawerState
  ) {
    super();
  }

  public ngOnInit() {
    this._headerFacade.tarifModalState
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap(() => {
          this.isLoader$.next(true);
          this._drawerState.setDrawerState(false);
        }),
        switchMap(() => this.getStayedPackages()),
        switchMap(() => this.getAllActivePackages()),
      )
      .subscribe(() => {
        this._modalService.createModal(this.titleTpl, this.contentTpl, null, null);
        this.isLoader$.next(false);
        this._cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  public navigateToBalance() {
    this._modalService.closeAll();
    this._router.navigateByUrl("/balance");
  }

  private getAllActivePackages(): Observable<IBalanceTariff[]> {
    return this.getBalanceTariff$.pipe(
      take(1),
      takeUntil(this.ngUnsubscribe),
      tap((data) => {
        if (data) {
          let sum = 0;
          let activeTariffs = "";
          data.forEach((item) => {
            if (item.isActive) {
              sum += item.count;
              activeTariffs += item.name + ", ";
            }
          });
          this.packageInfo$.next({
            ...this.packageInfo$.value,
            ...{
              allActivePackages: sum,
              activeTariffsNames: activeTariffs.slice(0, activeTariffs.length - 2),
            },
          });
        }
      })
    );
  }

  public getStayedPackages(): Observable<ICompany> {
    return this._companyFacade.getCompanyData$().pipe(
      take(1),
      takeUntil(this.ngUnsubscribe),
      tap((company) => {
        if (company) {
          this.packageInfo$.next({
            ...this.packageInfo$.value,
            ...{
              allActivePackages: 0,
              stayedPackages: company.packageCount,
              activeTariffUuid: company.activeTariffUuid,
            },
          });
        }
      })
    );
  }
}

import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { BalanceFacade } from "../../modules/balance/services/balance.facade";
import { BalanceService } from "../../modules/balance/services/balance.service";
import { IBalanceTariff } from "src/app/shared/interfaces/balance-tariff.interface";
import { IBalance } from "src/app/shared/interfaces/balance.interface";

@Component({
  selector: "hr-tariff",
  templateUrl: "./tariff.component.html",
  styleUrls: ["./tariff.component.scss"],
})
export class TariffComponent implements OnInit {
  public getBalanceTariff$: Observable<IBalanceTariff[]> = this._balanceFacade.getCompanyBalance();

  constructor(private readonly _balanceFacade: BalanceFacade, private readonly service: BalanceService) {}

  ngOnInit(): void { }

  public buyTariff(event: IBalance): void {
    if (!event?.isActive) {
      this.service.buyTariff(event?.uuid).subscribe((payment) => {
        window.location.replace(payment.robokassa_url);
      });
    }
  }
}

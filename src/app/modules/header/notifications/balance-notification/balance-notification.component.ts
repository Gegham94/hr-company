import {Component, Input, OnInit} from "@angular/core";
import {Observable, of} from "rxjs";
import {AuthService} from "../../../auth/auth.service";
import {BalanceFacade} from "../../../balance/balance.facade";
import {BalanceState} from "../../../balance/balance.state";

@Component({
  selector: "hr-balance-notification",
  templateUrl: "./balance-notification.component.html",
  styleUrls: ["./balance-notification.component.scss"]
})
export class BalanceNotificationComponent implements OnInit {

  @Input("isMenuOpen") isMenuOpen: boolean = false;

  public notificationCountForBalance$: Observable<number> = of(0);

  constructor(private readonly balanceFacade: BalanceFacade,
              private readonly balanceState: BalanceState,
              private readonly _authService: AuthService) {
  }

  ngOnInit(): void {
    if (this._authService.getToken) {
      this.balanceFacade.balanceTariffCount();
      this.notificationCountForBalance$ = this.balanceState.getTariffCount();
    }
  }

}

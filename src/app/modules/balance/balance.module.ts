import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BalanceRoutingModule } from "./balance-routing.module";
import { BalanceComponent } from "./balance.component";
import { UiModule } from "../../ui-kit/ui.module";
import { TranslateModule } from "@ngx-translate/core";
import {SharedModule} from "../../shared-modules/shared.module";
import {SpecialistsModule} from "../specialists/specialists.module";

@NgModule({
  declarations: [
    BalanceComponent
  ],
  exports: [BalanceComponent],
    imports: [
        CommonModule,
        BalanceRoutingModule,
        UiModule,
        TranslateModule,
        SharedModule,
        SpecialistsModule
    ]
})
export class BalanceModule {
}

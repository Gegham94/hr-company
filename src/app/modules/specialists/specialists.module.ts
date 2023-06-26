import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import * as echarts from "echarts";
import {NgxEchartsModule} from "ngx-echarts";
import {SpecialistsComponent} from "./specialists/specialists.component";
import {SpecialistsRoutingModule} from "./specialists-routing.module";
import {UiModule} from "../../ui-kit/ui.module";
import {SharedModule} from "../../shared-modules/shared.module";
import {SpecialistProfileComponent} from "./specialist-profile/specialist-profile.component";
import {ChatModule} from "../chat/chat.module";
import {
  VacanciesListComponent
} from "../../shared-modules/components/vacancies-list/vacancies-list.component";
import {TestsComponent} from "./tests/tests.component";
import {BuyTariffModalComponent} from "../../ui-kit/buy-tariff-modal/buy-tariff-modal.component";
import {MaskPipe} from "../app/pipes/mask-part-text.pipe";
import {AnalyticsComponent} from "./specialist-profile/analytics/analytics.component";
import {TestsListComponent} from "./specialist-profile/analytics/tests-list/tests-list.component";

@NgModule({
  declarations: [
    SpecialistsComponent,
    SpecialistProfileComponent,
    VacanciesListComponent,
    TestsComponent,
    AnalyticsComponent,
    TestsListComponent,
    BuyTariffModalComponent,
    MaskPipe
  ],
  exports: [
    SpecialistsComponent,
    SpecialistProfileComponent,
    VacanciesListComponent,
    BuyTariffModalComponent,
  ],
  imports: [
    CommonModule,
    SpecialistsRoutingModule,
    NgxEchartsModule.forRoot({echarts}),
    UiModule,
    SharedModule,
    ChatModule,
  ]
})
export class SpecialistsModule {
}

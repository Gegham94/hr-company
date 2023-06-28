import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import * as echarts from "echarts";
import { NgxEchartsModule } from "ngx-echarts";
import { SpecialistsComponent } from "../specialists/specialists.component";
import { SpecialistsRoutingModule } from "./specialists-routing.module";
import { UiModule } from "../../../ui-kit/ui.module";
import { ChatModule } from "../../chat/chat.module";
import { BuyTariffModalComponent } from "../../../ui-kit/buy-tariff-modal/buy-tariff-modal.component";
import { AnalyticsComponent } from "../specialist-profile/analytics/analytics.component";
import { TestsListComponent } from "../specialist-profile/analytics/tests-list/tests-list.component";
import { TranslateModule } from "@ngx-translate/core";
import { MaskPipe } from "src/app/shared/pipes/mask-part-text.pipe";
import { SharedModule } from "src/app/shared/shared.module";
import { VacanciesListComponent } from "src/app/shared/components/vacancies-list/vacancies-list.component";
import { SpecialistProfileComponent } from "../specialist-profile/specialist-profile.component";

@NgModule({
  declarations: [
    SpecialistsComponent,
    SpecialistProfileComponent,
    VacanciesListComponent,
    AnalyticsComponent,
    TestsListComponent,
    BuyTariffModalComponent,
    MaskPipe,
  ],
  exports: [SpecialistsComponent, SpecialistProfileComponent, VacanciesListComponent, BuyTariffModalComponent],
  imports: [
    CommonModule,
    SpecialistsRoutingModule,
    NgxEchartsModule.forRoot({ echarts }),
    UiModule,
    SharedModule,
    ChatModule,
    TranslateModule,
  ],
})
export class SpecialistsModule {}

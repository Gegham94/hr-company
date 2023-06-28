import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AnalyticRoutingModule } from "./analytic-routing.module";
import * as echarts from "echarts";
import { NgxEchartsModule } from "ngx-echarts";
import { TranslateModule } from "@ngx-translate/core";
import { AnalyticsComponent } from "../analytics.component";
import { VacancyInfoComponent } from "../vacancy-info/vacancy-info.component";
import { UiModule } from "../../../ui-kit/ui.module";
import { SpecialistsModule } from "../../specialists/modules/specialists.module";

@NgModule({
  declarations: [AnalyticsComponent, VacancyInfoComponent],
  exports: [AnalyticsComponent],
  imports: [
    CommonModule,
    AnalyticRoutingModule,
    NgxEchartsModule.forRoot({ echarts }),
    TranslateModule,
    UiModule,
    SpecialistsModule,
  ],
})
export class AnalyticModule {}

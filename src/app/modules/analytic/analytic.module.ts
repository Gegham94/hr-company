import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AnalyticRoutingModule } from "./analytic-routing.module";
import { AnalyticsComponent } from "./analytics.component";
import * as echarts from "echarts";
import { NgxEchartsModule } from "ngx-echarts";
import { TranslateModule } from "@ngx-translate/core";
import { SpecialistAnalyticComponent } from "./specialist-analytic/specialist-analytic.component";
import {UiModule} from "../../ui-kit/ui.module";
import {SpecialistsModule} from "../specialists/specialists.module";

@NgModule({
  declarations: [
    AnalyticsComponent,
    SpecialistAnalyticComponent
  ],
  exports: [
    AnalyticsComponent
  ],
  imports: [
    CommonModule,
    AnalyticRoutingModule,
    NgxEchartsModule.forRoot({echarts}),
    TranslateModule,
    UiModule,
    SpecialistsModule
  ]
})
export class AnalyticModule { }

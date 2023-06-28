import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { HomeRoutingModule } from "./home-routing.module";
import { HomeLayoutComponent } from "./home-layout/home-layout.component";
import { HeaderModule } from "../header/modules/header.module";
import { UiModule } from "../../ui-kit/ui.module";
import { TranslateModule } from "@ngx-translate/core";
import { RobotComponent } from "../../ui-kit/robot/robot.component";
import { IvyCarouselModule } from "angular-responsive-carousel";
import {SlickCarouselModule} from "ngx-slick-carousel";
import {ChatModule} from "../chat/chat.module";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {TooltipModule} from "ng2-tooltip-directive-ng13fix";
import {FooterComponent} from "../footer/footer.component";


@NgModule({
    declarations: [
        HomeLayoutComponent,
        RobotComponent,
        FooterComponent
    ],
    exports: [
        RobotComponent,
        FooterComponent
    ],
    imports: [
        CommonModule,
        HomeRoutingModule,
        HeaderModule,
        UiModule,
        TranslateModule,
        IvyCarouselModule,
        SlickCarouselModule,
        ChatModule,
        ScrollingModule,
        TooltipModule
    ]
})
export class HomeModule { }

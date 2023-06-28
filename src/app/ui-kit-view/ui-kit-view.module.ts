import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UiKitViewComponent } from "./ui-kit-view.component";
import { UiModule } from "../ui-kit/ui.module";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  declarations: [
    UiKitViewComponent
  ],
  imports: [
    CommonModule,
    UiModule,
    SharedModule,
  ]
})
export class UiKitViewModule { }

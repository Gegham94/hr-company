import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SignupRoutingModule } from "./signup-routing.module";
import { UiModule } from "../../../ui-kit/ui.module";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SignupComponent } from "./signup.component";
import { TranslateModule } from "@ngx-translate/core";
import { PhonePipe } from "../../app/pipes/phone-number.pipe";

@NgModule({
  declarations: [
    SignupComponent,
    PhonePipe
  ],
  imports: [
    CommonModule,
    SignupRoutingModule,
    UiModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  exports: [
    SignupComponent,
    PhonePipe
  ]
})
export class SignUpModule {}

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SignupRoutingModule } from "./signup-routing.module";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { PhonePipe } from "src/app/shared/pipes/phone-number.pipe";
import { SignupComponent } from "../signup.component";
import { UiModule } from "src/app/ui-kit/ui.module";

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

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SignInRoutingModule } from "./signin-routing.module";
import { SignInComponent } from "./signin.component";
import { UiModule } from "../../../ui-kit/ui.module";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { SignUpModule } from "../signup/signup.module";


@NgModule({
  declarations: [SignInComponent],
  imports: [
    CommonModule,
    SignInRoutingModule,
    UiModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    SignUpModule
  ],
  exports: [SignInComponent]
})
export class SignInModule {
}

import { Injectable, NgModule } from "@angular/core";
import { BrowserModule, HammerModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { UiModule } from "../../ui-kit/ui.module";
import { SharedModule } from "../../shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { UiKitViewModule } from "../../ui-kit-view/ui-kit-view.module";
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from "@angular/common/http";

import { HeaderModule } from "../header/modules/header.module";
import {
  TranslateLoader,
  TranslateModule,
  TranslatePipe,
} from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { HomeModule } from "../home/home.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import * as Hammer from "hammerjs";
import {
  HammerGestureConfig,
  HAMMER_GESTURE_CONFIG,
} from "@angular/platform-browser";
import {ModalComponent} from "../modal/modal.component";
import { JwtInterceptor } from "src/app/shared/interceptors/jwt.interceptor";

@Injectable()
export class MyHammerConfig extends HammerGestureConfig {
  override overrides = <any>{
    swipe: { direction: Hammer.DIRECTION_ALL },
  };
}

// AOT compilation support
export function httpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

// TODO: { provide: HTTP_INTERCEPTORS, useClass: CredentialsInterceptor, multi: true },


@NgModule({
    declarations: [AppComponent, ModalComponent],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    UiModule,
    ReactiveFormsModule,
    FormsModule,
    UiKitViewModule,
    HttpClientModule,
    HeaderModule,
    HomeModule,
    SharedModule,
    HammerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
      extend: true,
    }),
  ],
  bootstrap: [AppComponent],
  providers: [
    TranslatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyHammerConfig,
    },
  ],
  exports: [TranslateModule],
})
export class AppModule {}

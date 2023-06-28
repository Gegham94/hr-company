import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { LocalStorageService } from "src/app/shared/services/local-storage.service";
import { Languages, defaultLang } from "../app/constants";
@Component({
  selector: "hr-main",
  templateUrl: "./auth.component.html",
  styleUrls: ["./auth.component.scss"]
})
export class AuthComponent {

  constructor(
    public readonly _translate: TranslateService,
    private readonly _localStorageService: LocalStorageService
  ) {
    _translate.addLangs(Languages);
    this._localStorageService.setItem("language", defaultLang);
    _translate.setDefaultLang(this._localStorageService.getItem("language") ?? defaultLang);
    this._localStorageService.setItem("language", this._localStorageService.getItem("language") ?? defaultLang);
  }
}

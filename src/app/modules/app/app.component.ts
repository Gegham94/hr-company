import {Component, OnInit} from "@angular/core";
import {ShowLoaderService} from "./services/show-loader.service";
import {Observable} from "rxjs";
import {defaultLang, Languages} from "./constants";
import {TranslateService} from "@ngx-translate/core";
import {LocalStorageService} from "./services/local-storage.service";
import {StatusTypeEnum} from "./constants/status-type.enum";
import {ToastsService} from "./services/toasts.service";


@Component({
  selector: "hr-root",
  templateUrl: "app-component.html"
})
export class AppComponent implements OnInit {
  public isChangeRoute!: Observable<boolean>;
  public statusType: Observable<StatusTypeEnum> = this._toastsService.getStatus$().pipe();

  constructor(
    private showLoaderService: ShowLoaderService,
    public readonly _translate: TranslateService,
    public readonly _toastsService: ToastsService,
    private readonly _localStorageService: LocalStorageService
  ) {
    _translate.addLangs(Languages);
    this._localStorageService.setItem("language", defaultLang);
    _translate.setDefaultLang(this._localStorageService.getItem("language") ?? defaultLang);
    this._localStorageService.setItem("language", this._localStorageService.getItem("language") ?? defaultLang);
  }

  ngOnInit(): void {
    this.isChangeRoute = this.showLoaderService.getIsLoading();
  }
}

import { Component } from "@angular/core";
import { ButtonTypeEnum } from "../../app/constants/button-type.enum";
import { Location } from "@angular/common";
import { Router } from "@angular/router";

@Component({
  selector: "hr-no-access-error",
  templateUrl: "./no-access-error.component.html",
  styleUrls: ["./no-access-error.component.scss"]
})
export class NoAccessErrorComponent {
  public buttonTypesList = ButtonTypeEnum;

  constructor(private readonly _location: Location,
              private readonly _router: Router) {
  }

  public goBack(): void {
  this._router.navigateByUrl("/company");
  }
}

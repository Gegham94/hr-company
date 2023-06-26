import {Component} from "@angular/core";
import {ButtonTypeEnum} from "../../app/constants/button-type.enum";
import {Location} from "@angular/common";
import {Router} from "@angular/router";

@Component({
  selector: "hr-not-found-page",
  templateUrl: "./not-found-page.component.html",
  styleUrls: ["./not-found-page.component.scss"],
})
export class NotFoundPageComponent {
  public buttonTypesList = ButtonTypeEnum;

  constructor(private readonly _location: Location) {
  }

  public goBack(): void {
    this._location.back();
  }
}

import {Component} from "@angular/core";
import {Location} from "@angular/common";

@Component({
  selector: "hr-go-back",
  templateUrl: "./go-back.component.html",
  styleUrls: ["./go-back.component.scss"],
})
export class GoBackComponent {

  constructor(private location: Location) {}

  public goBack() {
    this.location.back();
  }
}

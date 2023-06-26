import {Component} from "@angular/core";
import {Router} from "@angular/router";

@Component({
  selector: "hr-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"]
})
export class FooterComponent {

  constructor(public _router: Router) {}

  public redirectToHomePage() {
    this._router.navigateByUrl("/");
  }

  public redirectTo(url: string) {
    window.open("http://80.249.146.197:3110" + url, "_blank");
  }
}

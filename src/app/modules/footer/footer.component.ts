import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../../environments/environment";

@Component({
  selector: "hr-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"],
})
export class FooterComponent {
  public readonly currentYear: number = new Date().getFullYear();
  public readonly socialItems = [
    {
      display_name: "+7 (915) 093-77-88",
      href: "tel:+7 (915) 093-77-88",
      image_path: "/phone.svg",
    },
    {
      display_name: "info@hrhunt.ru",
      href: "mailto:info@hrhunt.ru",
      image_path: "/msg.svg",
    },
    {
      display_name: "Telegram",
      href: "https://t.me/",
      image_path: "/telegram.svg",
    },
    {
      display_name: "Whatsapp",
      href: "https://wa.me/",
      image_path: "/whatsapp.svg",
    },
  ];

  constructor(public _router: Router) {}

  public redirectToHomePage() {
    this._router.navigateByUrl("/");
  }

  public redirectTo(url: string) {
    window.open(environment.footerUrl + url, "_blank");
  }
}

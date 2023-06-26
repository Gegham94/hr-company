import { Component, Input } from "@angular/core";

@Component({
  selector: "hr-loader",
  templateUrl: "./hr-loader.component.html",
  styleUrls: ["./hr-loader.component.scss"]
})
export class HrLoaderComponent{
  @Input() img?:boolean = false;
}

import {Component, EventEmitter, Output} from "@angular/core";

@Component({
  selector: "hr-switcher",
  templateUrl: "./switcher.component.html",
  styleUrls: ["./switcher.component.scss"]
})
export class SwitcherComponent {
  @Output() isCheckedRememberUser:EventEmitter<boolean> = new EventEmitter<boolean>(false);

  constructor() { }

  changes(event:any){
    this.isCheckedRememberUser.emit(event?.target?.checked);
  }

}

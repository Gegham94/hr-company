import {Component, EventEmitter, OnInit, Output} from "@angular/core";

@Component({
  selector: "app-show-password",
  templateUrl: "./show-password.component.html",
  styleUrls: ["./show-password.component.scss"]
})
export class ShowPasswordComponent implements OnInit {
  public isShowPassword: boolean = true;

  @Output() showPasswordValue = new EventEmitter<boolean>();

  constructor() {
  }

  ngOnInit(): void {
  }

  showPassword(): void {
    this.showPasswordValue.emit(this.isShowPassword);
    this.isShowPassword = !this.isShowPassword;
  }
}

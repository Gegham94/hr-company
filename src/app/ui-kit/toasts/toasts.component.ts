import {Component, Input, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {ToastsService} from "../../modules/app/services/toasts.service";
import {ToastInterface} from "../../modules/app/interfaces/toast.interface";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {StatusTypeEnum} from "../../modules/app/constants/status-type.enum";

@Component({
  selector: "hr-toasts",
  templateUrl: "./toasts.component.html",
  styleUrls: ["./toasts.component.scss"],
  animations: [
    trigger("fadeInOut", [
      state(
        "in",
        style({
          opacity: 1,
        })
      ),
      transition("void => *", [style({opacity: 0}), animate(200)]),
      transition("* => void", [animate(500, style({opacity: 0, transform: "translateX(-600px)"}))]),
    ]),
  ],
})
export class ToastsComponent implements OnInit {

  @Input("status-type") statusType: StatusTypeEnum = StatusTypeEnum.success;
  public toasts$!: Observable<ToastInterface[]>;
  public readonly statusTypeEnum = StatusTypeEnum;

  constructor(private toastService: ToastsService) {
  }

  ngOnInit(): void {
    this.toasts$ = this.toastService.getToast();
  }

  removeToast() {
    this.toastService.removeToast();
  }

}

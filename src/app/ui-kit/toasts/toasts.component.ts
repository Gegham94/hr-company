import {Component, Input, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {ToastsService} from "../../shared/services/toasts.service";
import {ToastInterface} from "../../shared/interfaces/toast.interface";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {StatusTypeEnum} from "../../shared/enum/status-type.enum";

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
          transform: "translateX(0)",
        })
      ),
      transition("void => *", [style({ opacity: 0, transform: "translateX(600px)" }), animate(300)]),
      transition("* => void", [animate(500, style({ opacity: 0, transform: "translateX(600px)" }))]),
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

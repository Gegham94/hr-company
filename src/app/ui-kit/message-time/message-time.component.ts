import {
  Component,
  ElementRef, EventEmitter,
  Input, OnDestroy,
  OnInit, Output,
  ViewChild
} from "@angular/core";
import {MessageTimeService} from "./message-time.service";
import {filter, takeUntil} from "rxjs";
import {Unsubscribe} from "../../shared/unsubscriber/unsubscribe";
import {SignInFacade} from "../../modules/auth/signin/services/signin.facade";
import Timeout = NodeJS.Timeout;

@Component({
  selector: "hr-message-time",
  templateUrl: "./message-time.component.html",
  styleUrls: ["./message-time.component.scss"]
})
export class MessageTimeComponent extends Unsubscribe implements OnInit, OnDestroy {

  @ViewChild("svg") svg!: ElementRef;

  @Input() disabled: boolean = true;
  @Output() getTimeFinish: EventEmitter<boolean> = new EventEmitter<boolean>();
  private interval: number = 0;
  private codeTime: number = 180;
  public timeNumber!: number;
  private step: number = this.codeTime;
  private timeout!: Timeout;

  constructor(
    private messageTimeService: MessageTimeService,
    private signInFacade: SignInFacade) {
    super();
  }

  ngOnInit(): void {
    this.sendMessageTime();
    this.sendCodeAgain();
    this.signInFacade.getErrorMessage$()
      .pipe(
        filter((err) => !!err.length),
        takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.svg.nativeElement.style.display = "block";
        this.timeNumber = this.interval;
      });
  }

  private sendCodeAgain() {
    this.messageTimeService.getNewCode().pipe(
      filter((s) => !!s),
      takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.svg.nativeElement.style.display = "block";
        this.step = this.codeTime;
        this.timeNumber = this.codeTime;
      });
  }

  private sendMessageTime(): void {
    this.timeout = setInterval(() => {
      if (this.timeNumber !== this.interval) {
        --this.step;
        this.timeNumber = Number(this.step.toLocaleString("en-US"));
      } else {
        clearInterval(this.timeout);
        this.getTimeFinish.emit(false);
        this.svg.nativeElement.style.display = "none";
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timeout);
    this.unsubscribe();
  }
}

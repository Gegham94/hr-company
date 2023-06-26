import {Component, EventEmitter, Input, OnDestroy, Output, SimpleChanges} from "@angular/core";
import {ChatFacade} from "../../modules/chat/chat.facade";

@Component({
  selector: "hr-modal",
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.scss"]
})
export class ModalComponent implements OnDestroy {
  @Input("is-open") isOpenProps: boolean = false;
  @Input("is-click-outside") isClickOutside: boolean = true;
  @Input("is-cross") isCross: boolean = true;
  @Input("width") width!: string;
  @Input("height") height!: string;
  @Output() whenModalClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private readonly _chatFacade: ChatFacade) {}

  public outsideClose() {
    if (this.isClickOutside) {
      this.isOpenProps = false;
      document.body.style.overflowY = "scroll";
      this.whenModalClose.emit(false);
      this._chatFacade.setCandidatesPopupStatus(false);
    }
  }

  public closeModal() {
    this.isOpenProps = false;
    document.body.style.overflowY = "scroll";
    this.whenModalClose.emit(false);
    this._chatFacade.setCandidatesPopupStatus(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isOpenProps"]?.currentValue) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "scroll";
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflowY = "scroll";
  }
}

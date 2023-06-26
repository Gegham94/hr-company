import {Component, EventEmitter, Input, Output} from "@angular/core";
import {SpecialistFacade} from "../../modules/specialists/specialist.facade";
import {SpecialistListsInterface} from "../../modules/specialists/interface/specialist-test.interface";
import {ButtonTypeEnum} from "../../modules/app/constants/button-type.enum";

@Component({
  selector: "hr-confirmation-modals",
  templateUrl: "./confirmation-modals.component.html",
  styleUrls: ["./confirmation-modals.component.scss"],
})
export class ConfirmationModalsComponent {

  @Input("isFirstChat") isFirstChat: boolean = true;
  @Input("isOpen") isOpen: boolean = false;
  @Input("specialist") specialist!: SpecialistListsInterface;
  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() startChat: EventEmitter<boolean> = new EventEmitter<boolean>();

  public readonly ButtonTypeEnum = ButtonTypeEnum;

  constructor(private readonly _specialistFacade: SpecialistFacade) {}

  public openChat() {
    this.startChat.emit(true);
  }

  public closeModal() {
    this.close.emit(true);
  }
}

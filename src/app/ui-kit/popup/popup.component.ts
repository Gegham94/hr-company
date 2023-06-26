import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from "@angular/core";
import {CandidatePopupTypeEnum, Reason, ReasonsOfResignEnum} from "./candidate-popup-type.enum";
import {SpecialistFacade} from "../../modules/specialists/specialist.facade";
import {FilteredSpecialistsListResult} from "../../modules/specialists/interfaces/specialist.interface";
import {BehaviorSubject, tap} from "rxjs";
import {ButtonTypeEnum} from "../../modules/app/constants/button-type.enum";
import {ChatFacade} from "../../modules/chat/chat.facade";
import {AcceptOrDeclineEnum} from "../../modules/chat/constants/accept-or-decline.enum";
import {Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: "hr-popup",
  templateUrl: "./popup.component.html",
  styleUrls: ["./popup.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopupComponent {
  @Input("is-name") popupName!: string;
  @Input("specialist-firstname") specialistFirstname!: string;
  @Input("specialist-lastname") specialistLastname!: string;
  @Input("vacancy-name") vacancyName!: string;
  @Output() whenPopupClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() whenAcceptOrDecline: EventEmitter<{ reason: string; type: AcceptOrDeclineEnum }>
    = new EventEmitter<{ reason: string; type: AcceptOrDeclineEnum }>();

  public readonly CandidatePopupTypeEnum = CandidatePopupTypeEnum;
  public readonly AcceptOrDeclineEnum = AcceptOrDeclineEnum;
  public readonly buttonTypesList = ButtonTypeEnum;
  public specialists: FilteredSpecialistsListResult[] = [];
  public isWritable = false;
  public resignText: string = "";
  public selectedReason!: Reason;

  public isCandidatesOpen = this._chatFacade.getCandidatesPopupStatus$();
  public isAcceptOrDeclineOpen = this._chatFacade.getAcceptOrDeclinePopupStatus$();

  public readonly reasonsOfResign: BehaviorSubject<Reason[]> = new BehaviorSubject<Reason[]>([
    {value: ReasonsOfResignEnum.Reason_1, id: 1, checked: false},
    {value: ReasonsOfResignEnum.Reason_2, id: 2, checked: false},
    {value: ReasonsOfResignEnum.Reason_3, id: 3, checked: false},
    {value: ReasonsOfResignEnum.Reason_4, id: 4, checked: false},
    {value: ReasonsOfResignEnum.Reason_5, id: 5, checked: false}
  ]);

  public readonly offerForm: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly _specialistFacade: SpecialistFacade,
    private readonly _chatFacade: ChatFacade,
    private readonly _cdr: ChangeDetectorRef,
  ) {
    this.offerForm = this.formBuilder.group({
      field_1: ["", [Validators.required]],
      field_2: ["", [Validators.required]],
      field_3: ["", [Validators.required]],
      field_4: ["", [Validators.required]],
      field_5: ["", [Validators.required]],
      field_6: ["", [Validators.required]],
      field_7: ["", [Validators.required]],
      field_8: ["", [Validators.required]],
      field_9: ["", [Validators.required]],
      field_10: ["", [Validators.required]],
      field_11: ["", [Validators.required]],
      field_12: ["", [Validators.required]],
      field_13: ["", [Validators.required]],
    });
  }

  public closeModal(event?: Event, isLastStep = false) {
    this._chatFacade.setAcceptOrDeclinePopupStatus$(false);
  }

  public acceptOrDecline(): void {
    this._chatFacade.setAcceptOrDeclinePopupStatus$(false);

    if (this.popupName === AcceptOrDeclineEnum.ACCEPTED) {
      this.whenAcceptOrDecline.emit({reason: "", type: AcceptOrDeclineEnum.ACCEPTED});
    } else if (this.popupName === AcceptOrDeclineEnum.REJECTED) {
      if (this.selectedReason.value !== ReasonsOfResignEnum.Reason_5) {
        this.whenAcceptOrDecline.emit({reason: this.selectedReason.value, type: AcceptOrDeclineEnum.REJECTED});
      } else {
        this.whenAcceptOrDecline.emit({reason: this.resignText, type: AcceptOrDeclineEnum.REJECTED});
      }
    }
    this.closeModal();
    // todo: when modal open we need "block" body scroll
  }

  public select(event: boolean, reason: Reason) {
    const reasonCopy = JSON.parse(JSON.stringify(reason));
    this.reasonsOfResign.next(this.reasonsOfResign.value.map(data => {
        data.checked = false;
        if (data.id === reason.id) {
          data.checked = !reasonCopy.checked;
          if (data.checked) {
            this.selectedReason = data;
          }
        }
        return data;
      })
    );
    if (reason.id === 5) {
      this.isWritable = !this.isWritable;
      this.resignText = "";
    }
    this._cdr.detectChanges();
  }

}

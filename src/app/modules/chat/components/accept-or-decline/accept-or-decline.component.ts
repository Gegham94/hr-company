import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { AcceptOrDeclineEnum } from "../../constants/accept-or-decline.enum";
import { IReason, ReasonsOfDeclineEnum } from "../../constants/candidate-popup-type.enum";
import { BehaviorSubject, takeUntil } from "rxjs";
import { ChatFacade } from "../../chat.facade";
import { ReasonsOfDecline } from "./mock";
import { OfferForm } from "./form";
import { HrModalService } from "../../../modal/hr-modal.service";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { ButtonTypeEnum } from "src/app/shared/enum/button-type.enum";

@Component({
  selector: "hr-accept-or-decline",
  templateUrl: "./accept-or-decline.component.html",
  styleUrls: ["./accept-or-decline.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcceptOrDeclineComponent extends Unsubscribe implements AfterViewInit, OnDestroy {
  @ViewChild("contentTpl") contentTpl!: TemplateRef<any>;
  @ViewChild("titleTpl") titleTpl!: TemplateRef<any>;

  @Input() popupName!: string;
  @Output() isConfirmed: EventEmitter<{ reason: string; type: AcceptOrDeclineEnum }> = new EventEmitter<{
    reason: string;
    type: AcceptOrDeclineEnum;
  }>();

  public isWritable: boolean = false;
  public resignText: string = "";
  public selectedReason: BehaviorSubject<IReason | null> = new BehaviorSubject<IReason | null>(null);

  public readonly AcceptOrDeclineEnum = AcceptOrDeclineEnum;
  public readonly buttonTypesList = ButtonTypeEnum;
  public readonly reasonsOfDecline: BehaviorSubject<IReason[]> = new BehaviorSubject<IReason[]>(ReasonsOfDecline);
  public readonly offerForm: FormGroup = this._offerForm.formGroup;

  constructor(
    private readonly _modalService: HrModalService,
    private readonly _chatFacade: ChatFacade,
    private readonly _offerForm: OfferForm,
    private readonly _cdr: ChangeDetectorRef
  ) {
    super();
  }

  public ngAfterViewInit(): void {
    this._chatFacade.openAcceptOrRejectModal$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this._modalService.createModal(this.titleTpl, this.contentTpl, null, null);
    });
  }

  public select(event: boolean, reason: IReason): void {
    const reasonCopy = JSON.parse(JSON.stringify(reason));

    this.reasonsOfDecline.next(
      this.reasonsOfDecline.value.map((data) => {
        const checked = data.id === reason.id ? !reasonCopy.checked : data.checked;
        if (checked) {
          this.selectedReason.next(data);
        }
        return { ...data, checked };
      })
    );
    if (reason.id === 5) {
      this.isWritable = !this.isWritable;
      this.resignText = "";
    }
    this._cdr.detectChanges();
  }

  public acceptOrDecline(): void {
    if (this.popupName === AcceptOrDeclineEnum.ACCEPTED) {
      this.emitAcceptOrDeclineEvent("", AcceptOrDeclineEnum.ACCEPTED);
    } else if (this.popupName === AcceptOrDeclineEnum.REJECTED) {
      if (this.selectedReason.value) {
        if (this.selectedReason.value.value !== ReasonsOfDeclineEnum.Reason_5) {
          this.emitAcceptOrDeclineEvent(this.selectedReason.value.value, AcceptOrDeclineEnum.REJECTED);
        } else {
          this.emitAcceptOrDeclineEvent(this.resignText, AcceptOrDeclineEnum.REJECTED);
        }
      }
    }
  }

  private emitAcceptOrDeclineEvent(reason: string, type: AcceptOrDeclineEnum): void {
    this.isConfirmed.emit({ reason, type });
    this._modalService.closeAll();
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}

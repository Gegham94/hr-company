import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild
} from "@angular/core";
import {takeUntil} from "rxjs";
import { HrModalService } from "src/app/modules/modal/hr-modal.service";
import { ISpecialistLists } from "src/app/modules/specialists/interfaces/specialist-test.interface";
import { SpecialistFacade } from "src/app/modules/specialists/services/specialist.facade";
import { ButtonTypeEnum } from "src/app/shared/enum/button-type.enum";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";

@Component({
  selector: "hr-confirmation-modals",
  templateUrl: "./confirmation-modals.component.html",
  styleUrls: ["./confirmation-modals.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationModalsComponent extends Unsubscribe implements OnDestroy, AfterViewInit {
  @ViewChild("contentTpl") contentTpl!: TemplateRef<any>;
  @ViewChild("titleTpl") titleTpl!: TemplateRef<any>;

  @Input("isFirstChat") isFirstChat: boolean = true;
  @Input("isOpen") isOpen: boolean = false;
  @Input("specialist") specialist!: ISpecialistLists;
  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() startChat: EventEmitter<boolean> = new EventEmitter<boolean>();

  public readonly ButtonTypeEnum = ButtonTypeEnum;

  constructor(
    private readonly _specialistFacade: SpecialistFacade,
    private readonly _modalService: HrModalService,
  ) {
    super();
  }

  public ngAfterViewInit(): void {
    this._specialistFacade.openConfirmationModal$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this._modalService.createModal(this.titleTpl, this.contentTpl, null, null);
      }
    );
  }

  public openChat(): void {
    this.startChat.emit(true);
    this._modalService.closeAll();
  }

  public closeModal(): void {
    this._modalService.closeAll();
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}

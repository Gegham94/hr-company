import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { distinctUntilChanged, Observable, of, switchMap, takeUntil } from "rxjs";
import { CompanyFacade } from "src/app/modules/company/services/company.facade";
import { HrModalService } from "src/app/modules/modal/hr-modal.service";
import { SpecialistFacade } from "src/app/modules/specialists/services/specialist.facade";
import { ICompany } from "src/app/shared/interfaces/company.interface";
import { LocalStorageService } from "src/app/shared/services/local-storage.service";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";

@Component({
  selector: "app-chat-open-modal",
  templateUrl: "./chat-open-modal.component.html",
  styleUrls: ["./chat-open-modal.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatOpenModalComponent extends Unsubscribe implements OnDestroy, AfterViewInit {
  @ViewChild("contentTpl") contentTpl!: TemplateRef<any>;
  @ViewChild("titleTpl") titleTpl!: TemplateRef<any>;
  @Output() openConversationModals: EventEmitter<boolean> = new EventEmitter();

  public specialistName!: string;
  public specialistSurname!: string;
  public isHelper: boolean = false;

  public company$: Observable<ICompany> = this._companyFacade.getCompanyData$();

  constructor(
    private readonly _localStorage: LocalStorageService,
    private readonly _companyFacade: CompanyFacade,
    private readonly _specialistFacade: SpecialistFacade,
    private readonly _modalService: HrModalService,
    private readonly _cdr: ChangeDetectorRef
  ) {
    super();
  }

  public ngAfterViewInit(): void {
    this._specialistFacade.openCandidatesModal$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.specialistName = data.specialist.name;
      this.specialistSurname = data.specialist.surname;
      this.isHelper = data.isHelper;
      this._modalService.createModal(this.titleTpl, this.contentTpl, null, null);
      this._cdr.markForCheck();
    });
  }

  public openChat(state: boolean): void {
    if (state) {
      this.closeChatConversation(state);
    } else {
      this.openConversationModals.emit(false);
      this._modalService.closeAll();
    }
  }

  private closeChatConversation(state: boolean): void {
    this.company$
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.ngUnsubscribe),
        switchMap((company) => {
          const chatOpenedIndex = company.helper?.findIndex((data) => data.link === "chat-opened") ?? -1;
          if (company.helper && chatOpenedIndex >= 0 && !company.helper[chatOpenedIndex].hidden) {
            company.helper[chatOpenedIndex].hidden = true;
            this._localStorage.setItem("company", JSON.stringify(company));
            return this._companyFacade.updateCurrentPageRobot(company.helper[chatOpenedIndex].uuid);
          }
          return of(null);
        })
      )
      .subscribe();

    this.openConversationModals.emit(state);
    this._modalService.closeAll();
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}

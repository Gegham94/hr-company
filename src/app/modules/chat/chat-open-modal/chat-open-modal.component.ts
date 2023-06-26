import {Component, EventEmitter, Input, Output, TemplateRef, ViewChild} from "@angular/core";
import {Unsubscribe} from "../../../shared-modules/unsubscriber/unsubscribe";
import {distinctUntilChanged, Observable, of, switchMap, takeUntil} from "rxjs";
import {CompanyInterface} from "../../app/interfaces/company.interface";
import {LocalStorageService} from "../../app/services/local-storage.service";
import {ChatFacade} from "../chat.facade";
import {CompanyFacade} from "../../company/company.facade";


@Component({
  selector: "app-chat-open-modal",
  templateUrl: "./chat-open-modal.component.html",
  styleUrls: ["./chat-open-modal.component.scss"]
})
export class ChatOpenModalComponent extends Unsubscribe {

  @Input() specialistName!: string;
  @Input() specialistSurname!: string;
  @Input() isHelper: boolean = false;
  @Input() isOpen: boolean = false;
  @Output() public openConversationModals: EventEmitter<boolean> = new EventEmitter();
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();

  public isCandidatesOpen = this._chatFacade.getCandidatesPopupStatus$();
  public isAcceptOrDeclineOpen = this._chatFacade.getAcceptOrDeclinePopupStatus$();
  public company$: Observable<CompanyInterface> = of(JSON.parse(this._localStorage.getItem("company")));

  // tslint:disable-next-line:no-any
  @ViewChild("step1") public step1!: TemplateRef<any>;
  // tslint:disable-next-line:no-any
  @ViewChild("step2") public step2!: TemplateRef<any>;
  // tslint:disable-next-line:no-any
  @ViewChild("step3") public step3!: TemplateRef<any>;
  // tslint:disable-next-line:no-any
  @ViewChild("step4") public step4!: TemplateRef<any>;

  constructor(
    private readonly _localStorage: LocalStorageService,
    private readonly _chatFacade: ChatFacade,
    private readonly _companyFacade: CompanyFacade,
  ) {
    super();
  }

  public openChat(state: boolean): void {
    if (state) {
      this.company$.pipe(
        distinctUntilChanged(),
        takeUntil(this.ngUnsubscribe),
        switchMap(company => {
          const chatOpenedIndex = company.helper?.findIndex((data) => data["link"] === "chat-opened") ?? -1;
          if (company.helper && !company.helper[chatOpenedIndex]?.hidden && chatOpenedIndex >= 0) {
            company.helper[chatOpenedIndex]["hidden"] = true;
            this._localStorage.setItem("company", JSON.stringify(company));
            return this._companyFacade.updateCurrentPageRobot(
              company.helper[chatOpenedIndex]["uuid"]);
          }
          return of(null);
        })
      ).subscribe();
      this.openConversationModals.emit(true);
    } else {
      this.openConversationModals.emit(false);
    }

  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}

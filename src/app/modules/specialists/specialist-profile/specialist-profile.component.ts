import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {BehaviorSubject, delay, filter, Observable, of, shareReplay, takeUntil, tap} from "rxjs";
import {ISpecialist} from "./interfaces/specialist.interface";
import {StartChatBtnTextEnum} from "../constants/start-chat-btn-text.enum";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { ProgressBarEnum } from "src/app/shared/enum/progress-bar.enum";
import { ICompany } from "src/app/shared/interfaces/company.interface";
import { ButtonTypeEnum } from "src/app/shared/enum/button-type.enum";
import { Conversation } from "../../chat/interfaces/conversations";
import { CompanyFacade } from "../../company/services/company.facade";
import { SpecialistFacade } from "../services/specialist.facade";
import { ChatFacade } from "../../chat/chat.facade";
import { LocalStorageService } from "src/app/shared/services/local-storage.service";
import { HrModalService } from "../../modal/hr-modal.service";
import { AcceptOrDeclineEnum } from "../../chat/constants/accept-or-decline.enum";


@Component({
  selector: "app-specialist-profile",
  templateUrl: "./specialist-profile.component.html",
  styleUrls: ["./specialist-profile.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpecialistProfileComponent extends Unsubscribe implements OnInit, OnDestroy {
  @Input("type-props") typeProps = ProgressBarEnum;
  @Input("user-profession") userProfessionProps!: string;
  @Input("user-post") userPostProps!: string;
  @Input("progress-psychology") progressPsychologyProps!: number;
  @Input("progress-professional") progressProfessionalProps!: number;
  @Input("progress-interview") progressInterviewProps!: number;

  public uuid!: string;
  public foundSpecialistsUuid!: string;

  public specialistList$: Observable<ISpecialist | null> = this._specialistFacade.getSelectedSpecialistByUuid()
	.pipe(shareReplay(1));

  public company$: Observable<ICompany> = this._companyFacade.getCompanyData$();

  public readonly buttonType = ButtonTypeEnum;
  public readonly StartChatBtnTextEnum = StartChatBtnTextEnum;

  public isHelper!: boolean;

  public isFirstChat$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isChatBtn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public startChatText$: BehaviorSubject<string> = new BehaviorSubject<string>("");

  public isFavorite!: boolean;
  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  private conversations$: Observable<Conversation[]> = this._chatFacade.getConversations$();
  private currentConversation$: BehaviorSubject<Conversation | null> = new BehaviorSubject<Conversation | null>(null);

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _companyFacade: CompanyFacade,
    private readonly _specialistFacade: SpecialistFacade,
    private readonly _chatFacade: ChatFacade,
    private readonly _localStorage: LocalStorageService,
    private readonly _modalService: HrModalService,
    private readonly _cdr: ChangeDetectorRef
  ) {
    super();
    this.uuid = this._route.snapshot.queryParams?.["uuid"];
    this.foundSpecialistsUuid = this._route.snapshot.queryParams?.["foundSpecialistUuid"];
  }


  public ngOnInit(): void {
    this.isLoader$.next(true);
    this.isFavorite = JSON.parse(this._localStorage.getItem("isFavorite"));
    this.isRobot();
    this.specialistList$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        delay(300),
      ).subscribe({
      next: () => {
        this.hasThisSpecialistConversation();
        this.isLoader$.next(false);
        this._cdr.markForCheck();
      },
      error: () => {
        this.isLoader$.next(false);
        this._cdr.markForCheck();
      }
    });

    this._specialistFacade.setSelectedSpecialistByUuid(this.uuid, this.foundSpecialistsUuid)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe();

    this._specialistFacade.openConversationModals$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        if (this.currentConversation$.value) {
          this._chatFacade.setChatSettings({
            isOpen: true,
            isMessagesContent: true,
          });
          this._chatFacade.setSelectedConversation$(this.currentConversation$.value);
        } else {
          this.isFirstChat$.next(JSON.parse(this._localStorage.getItem("isFirstChat")));
          this._specialistFacade.openConfirmationModal$.next();
        }
      });
  }

  private hasThisSpecialistConversation() {
    this.conversations$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap((conversations: Conversation[]) => {
            const currentConversation = conversations.find(conversation =>
              conversation.other_info.foundSpecialistUuid === this.foundSpecialistsUuid);
            if (currentConversation) {
              this.currentConversation$.next(currentConversation);
              this.startChatText$.next(StartChatBtnTextEnum.startChat);
            } else {
              this.startChatText$.next(StartChatBtnTextEnum.openChat);
            }

            if (currentConversation && (currentConversation.other_info.interviewStatus === AcceptOrDeclineEnum.ACCEPTED
              || currentConversation.other_info.interviewStatus === AcceptOrDeclineEnum.REJECTED)) {
              this.isChatBtn$.next(false);
            } else {
              this.isChatBtn$.next(true);
            }

          }
        )).subscribe(() => {
      this._cdr.markForCheck();
    });
  }

  public inviteSpecialistInChatAction() {
    const company = this._companyFacade.getCompanyData();

    if (company && company?.uuid) {
      this._chatFacade.emitConversationCompanyToSpecialist(company.uuid, this.uuid, this.foundSpecialistsUuid);
      this.hideSpecialists();
      this._chatFacade.getConversationsRequest()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(conversations => {
          if (!!conversations.length) {
            const selectedConversation = conversations.find(item =>
              item.other_info.foundSpecialistUuid === this.foundSpecialistsUuid);
            if (selectedConversation) {
              this._chatFacade.setSelectedConversation$(selectedConversation);
              this._chatFacade.setChatSettings({
                isOpen: true,
                isMessagesContent: true,
              });
            }
          }
        });
    }
  }

  public hideSpecialists(): void {
    if (this._localStorage.getItem("vacancyId")) {
      const vacancyId = JSON.parse(this._localStorage.getItem("vacancyId"));
      this._chatFacade.hideOtherSpecialistRequest(this.uuid, vacancyId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe();
    }
  }

  public getIsHelper(): boolean {
    if (this._localStorage.getItem("company")) {
      const company = JSON.parse(this._localStorage.getItem("company"));
      const robotHelperChat = company.helper.find((item: { link: string; }) => item.link = "chat-opened");
      return robotHelperChat.hidden;
    }
    return false;
  }

  public isRobot(): void {
    this.company$
      .pipe(filter(data => !!data?.phone))
      .subscribe(data => {
        const specialist = data.helper?.find((item => item.link === "/specialist-info"));

        this._specialistFacade.isRobot({
          content: "Specialist profile - helper",
          navigationItemId: null,
          isContentActive: true,
        });

        if (specialist && !specialist?.hidden) {
          this._specialistFacade.isRobot({
            content: "Specialist profile",
            navigationItemId: null,
            isContentActive: true,
            uuid: specialist?.uuid
          });
          this._specialistFacade.openRobot(true);
        }
      });
  }

  public startChat(specialist: ISpecialist): void {
    const company = this._companyFacade.getCompanyData();
    const checkChatStartStatusIndex =
      company.helper?.findIndex((item) => item["link"] === "chat-opened") ?? -1;
    if (company.helper && checkChatStartStatusIndex >= 0 && !company.helper[checkChatStartStatusIndex].hidden) {
      if (localStorage.getItem("filtered_vacancies")) {
        const vacancy = JSON.parse(JSON.stringify(localStorage.getItem("filtered_vacancies")));
        if (vacancy && vacancy.length > 0) {
          this._specialistFacade.openCandidatesModal$.next({
            isHelper: false,
            specialist: {
              name: specialist.name,
              surname: specialist.surname,
              vacancy: vacancy[0].displayName
            }
          });
        }
      }
    } else {
      this._specialistFacade.openConversationModals$.next();
    }
  }

  public updateFavorites(): void {
    this._specialistFacade.updateFavorites(this.foundSpecialistsUuid, !this.isFavorite)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: { data: string }) => {
        if (data.data) {
          this.isFavorite = !this.isFavorite;
          this._localStorage.setItem("isFavorite", JSON.stringify(this.isFavorite));
          this._cdr.detectChanges();
        }
      });
  }

  public ngOnDestroy(): void {
    this._specialistFacade.deleteSelectedSpecialistByUuid();
    this.unsubscribe();
  }
}

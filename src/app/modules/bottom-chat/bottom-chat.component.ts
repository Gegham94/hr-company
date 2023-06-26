import {Component} from "@angular/core";
import {BehaviorSubject, map, Observable, of, skip, switchMap, takeUntil} from "rxjs";
import {ChatFacade} from "../chat/chat.facade";
import {ScreenSizeType} from "../app/interfaces/screen-size.type";
import {ScreenSizeService} from "../app/services/screen-size.service";
import {GlobalNotificationItem} from "../header/interfaces/notifications.interface";
import {SpecialistFacade} from "../specialists/specialist.facade";
import {Unsubscribe} from "../../shared-modules/unsubscriber/unsubscribe";
import {IConversation} from "../chat/interfaces/conversations";
import {SpecialistService} from "../specialists/specialist.service";
import {BottomChatSettings, ChatHelperService} from "../app/services/chat-helper.service";
import {LocalStorageService} from "../app/services/local-storage.service";
import {WindowNotificationService} from "../app/services/window-notification.service";

@Component({
  selector: "hr-bottom-chat",
  templateUrl: "./bottom-chat.component.html",
  styleUrls: ["./bottom-chat.component.scss"],
})
export class BottomChatComponent extends Unsubscribe {
  public bottomChatSettings: Observable<BottomChatSettings> = this._chatHelperService.getIsBottomChatOpen();
  public isHelper!: boolean;
  public currentStepNote: GlobalNotificationItem[] = [];
  public conversations$!: Observable<IConversation[] | null>;
  public selectedSpecialistUuid: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public foundSpecialistsUuid: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public isOpenedFirst: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  get screenSize(): ScreenSizeType {
    return this.screenSizeService.calcScreenSize;
  }

  get virtualContainerHeight(): number {
    return this.screenSize === "DESKTOP" ? 350 : window.innerHeight - 55;
  }

  get virtualScrollItemSize(): number {
    return this.screenSize === "EXTRA_SMALL" ? 41 : 41;
  }

  constructor(
    private readonly _chatFacade: ChatFacade,
    private readonly _specialistFacade: SpecialistFacade,
    private readonly _specialistService: SpecialistService,
    private readonly _chatHelperService: ChatHelperService,
    private readonly _localStorage: LocalStorageService,
    private readonly screenSizeService: ScreenSizeService,
    private readonly _windowNotificationService: WindowNotificationService
  ) {
    super();
  }

  ngOnInit() {
    if (this._localStorage.getItem("foundSpecialistUuid")) {
      this.foundSpecialistsUuid.next(JSON.parse(this._localStorage.getItem("foundSpecialistUuid")));
    }

    this.conversations$ = this._chatFacade.emitGetConversationsRequest()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((conversations) => {
          return this.bottomChatSettings.pipe(
            map(data => {
              if (this.isOpenedFirst.value) {
                if (conversations?.length) {
                  if (conversations.length === 1) {
                    this._chatFacade.setConversations(conversations);
                    if (data.isMessagesContent) {
                      this.inviteSpecialistInChatAction(conversations[0], conversations, 0);
                    }
                    return conversations;
                  }

                  const unreadConversations = conversations.filter(conv => conv.last_message?.messageStatus === false);
                  const readConversations = conversations.filter(conv => conv.last_message?.messageStatus === true);

                  let sortedUnreadConversations: IConversation[] = unreadConversations.sort((item1, item2) => {
                    return (
                      new Date(item2.last_message.createdAt).getTime() -
                      new Date(item1.last_message.createdAt).getTime()
                    );
                  });

                  let sortedReadConversations: IConversation[] = readConversations.sort((item1, item2) => {
                    return (
                      new Date(item2.last_message.createdAt).getTime() -
                      new Date(item1.last_message.createdAt).getTime()
                    );
                  });

                  sortedUnreadConversations = Array.isArray(sortedUnreadConversations) ?
                    sortedUnreadConversations : [sortedUnreadConversations];

                  sortedReadConversations = Array.isArray(sortedReadConversations)
                    ? sortedReadConversations : [sortedReadConversations];

                  const allSortedConversations = [...sortedUnreadConversations, ...sortedReadConversations];

                  if (data.isMessagesContent && allSortedConversations?.length) {
                    const selected_conversation =
                      allSortedConversations.find(item => item?.other_info?.foundSpecialistUuid
                        === this.foundSpecialistsUuid.value);

                    const selected_conversation_index =
                      allSortedConversations.findIndex(item => item?.other_info?.foundSpecialistUuid
                        === this.foundSpecialistsUuid.value);

                    if (selected_conversation_index > -1 && selected_conversation) {
                      allSortedConversations?.splice(selected_conversation_index, 1);
                      allSortedConversations.unshift(selected_conversation);
                    }

                    // this._chatFacade.updateConversationMessage(allSortedConversations[0].last_message.messageUuid, {
                    //   status: true,
                    // });

                    const updatedUnreadConversations =
                      allSortedConversations.filter((item) =>
                        !item.last_message.messageStatus &&
                        !!item.last_message.senderUuid
                      );

                    if (updatedUnreadConversations?.length) {
                      this._chatFacade.setIsUnreadMessage(true);
                    } else {
                      this._chatFacade.setIsUnreadMessage(false);
                    }

                    this._windowNotificationService.createNotification("", unreadConversations.length);
                    this._chatFacade.setConversation(allSortedConversations[0]);
                  }
                  return allSortedConversations;
                }
                return null;
              }
              return conversations;
            })
          );
        })
      );

    this._chatFacade.getConversations$()
      .pipe(
        skip(1),
        takeUntil(this.ngUnsubscribe)
      ).subscribe(data => {
      if (data) {
        this.conversations$ = of(data);
      }
    });

    this._chatFacade.getConversation$()
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(data => {
        if (data) {
          this.selectedSpecialistUuid.next(data?.other_info?.foundSpecialistUuid);
        }
      });
  }

  public openCandidatesPopups(): void {
    this._chatFacade.setCandidatesPopupStatus(true);
    this.isHelper = true;
  }

  public inviteSpecialistInChatAction(conversation: IConversation, conversations: IConversation[], index: number) {
    this.isOpenedFirst.next(false);
    if (this.selectedSpecialistUuid.value !== conversation?.other_info?.foundSpecialistUuid) {
      this.selectedSpecialistUuid.next(conversation?.other_info?.foundSpecialistUuid);

      this._chatHelperService.isBottomChatOpen$.next({
        isOpen: true,
        isMessagesContent: true,
      });

      this._specialistService.getSpecialistCard(conversation?.userTwo, conversation?.other_info.foundSpecialistUuid)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((specialist) => {
          this._specialistFacade.setSpecialist(specialist?.specialist);
        });

      this._chatFacade.setConversation(conversation);

      if (!conversation?.last_message?.messageStatus) {
        conversations[index]["last_message"].messageStatus = true;

        const unreadConversations = conversations.filter((item) =>
          !item.last_message.messageStatus &&
          !!item.last_message.senderUuid
        );

        if (unreadConversations?.length) {
          this._chatFacade.setIsUnreadMessage(true);
        } else {
          this._chatFacade.setIsUnreadMessage(false);
        }

        this._windowNotificationService.createNotification("", unreadConversations.length);

        this._chatFacade.updateConversationMessage(conversations[index]?.last_message?.messageUuid, {
          status: true,
        });
      }

      this.conversations$ = of(conversations);
    }
  }
}

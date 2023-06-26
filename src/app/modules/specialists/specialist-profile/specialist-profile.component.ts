import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ButtonTypeEnum} from "../../app/constants/button-type.enum";
import {ProgressBarEnum} from "../../app/constants/progress-bar.enum";
import {SpecialistFacade} from "../specialist.facade";
import {BehaviorSubject, filter, map, Observable, of, switchMap, take, takeUntil, tap} from "rxjs";
import {ChatFacade} from "../../chat/chat.facade";
import {ChatService} from "../../chat/chat.service";
import {CompanyFacade} from "../../company/company.facade";
import {CompanyInterface} from "../../app/interfaces/company.interface";
import {SpecialistService} from "../specialist.service";
import {
  QuestionsAnswersInterface,
  SpecialistListsInterface,
} from "../interface/specialist-test.interface";
import {Unsubscribe} from "../../../shared-modules/unsubscriber/unsubscribe";
import {CandidatePopupTypeEnum} from "../../../ui-kit/popup/candidate-popup-type.enum";
import {HomeLayoutState} from "../../home/home-layout/home-layout.state";
import {LocalStorageService} from "../../app/services/local-storage.service";
import {RobotHelperService} from "../../app/services/robot-helper.service";
import {ObjectType} from "../../../shared-modules/types/object.type";
import {TestCategory} from "../constants/tests.enum";
import {colorsProfTests, colorsPsychoTests} from "../mock/colors.mock";
import {BottomChatSettings, ChatHelperService} from "../../app/services/chat-helper.service";
import {IConversation} from "../../chat/interfaces/conversations";
import {StartChatBtnTextEnum} from "../constants/start-chat-btn-text.enum";


@Component({
  selector: "app-specialist-profile",
  templateUrl: "./specialist-profile.component.html",
  styleUrls: ["./specialist-profile.component.scss"]
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
  public specialistList$: BehaviorSubject<SpecialistListsInterface | null> =
    new BehaviorSubject<SpecialistListsInterface | null>(null);
  public chatPopupStatus$: Observable<boolean> = this._chatFacade.getChatPopupStatus$();
  public company$: Observable<CompanyInterface> = of(JSON.parse(this._localStorage.getItem("company")));
  public questionAnswers$!: Observable<QuestionsAnswersInterface[]>;
  public isNotification!: boolean;

  public readonly buttonType = ButtonTypeEnum;
  public readonly CandidatePopupType = CandidatePopupTypeEnum;
  public pointsQuestions$: Observable<number> = of(0);
  public isRobotHelper: Observable<boolean> = this._homeLayoutState.getIsRobotHelper$();
  public isRobotMap: Observable<boolean> = this._homeLayoutState.getIsRobotMap();
  public groupByTypeOfQuiz: ObjectType = {};
  public groupByCategoryOfPsychological: ObjectType = [];
  public groupByCategoryOfProgramming: ObjectType = [];
  public isTestsListVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public selectedTestsGroup: BehaviorSubject<ObjectType> = new BehaviorSubject<ObjectType>([]);
  public readonly TestCategory = TestCategory;
  public readonly StartChatBtnTextEnum = StartChatBtnTextEnum;

  public isHelper!: boolean;
  public openCandidates: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public showConfirmationModal$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isFirstChat$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isChatBtn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public startChatText$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public conversationUuid$: Observable<string>;
  public conversations$!: Observable<IConversation[]>;
  public isFavorite!: boolean;
  public bottomChatSettings: Observable<BottomChatSettings> = this._chatHelperService.getIsBottomChatOpen();
  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _chatService: ChatService,
    private readonly _companyFacade: CompanyFacade,
    private readonly _specialistFacade: SpecialistFacade,
    private readonly _specialistService: SpecialistService,
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly _chatFacade: ChatFacade,
    private readonly _router: Router,
    private readonly _localStorage: LocalStorageService,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _chatHelperService: ChatHelperService,
    public _cdr: ChangeDetectorRef
  ) {
    super();
    this.uuid = this._route.snapshot.queryParams?.["uuid"];
    this.foundSpecialistsUuid = this._route.snapshot.queryParams?.["foundSpecialistUuid"];
    this.getSpecialistCard();
    this.conversationUuid$ = this._chatFacade.getConversationUuid$();
  }


  public ngOnInit(): void {
    this.isNotification = Boolean(this._route.snapshot.queryParams?.["notification"]);
    this.isFavorite = JSON.parse(this._localStorage.getItem("isFavorite"));
    this._chatFacade.getConversationUuid$()
      .pipe(
        takeUntil(this.ngUnsubscribe),
      ).subscribe((conversations) => {
      if (conversations) {
        this._chatHelperService.setIsBottomChatOpen({
          isOpen: true,
          isMessagesContent: true,
          isConversationNeedSort: true
        });
      }
    });

    // this._chatFacade.getCandidatesPopupStatus$()
    //   .pipe(takeUntil(this.ngUnsubscribe))
    //   .subscribe(data => {
    //     this.openCandidates.next(data);
    //     if (!data) {
    //       if (this.specialistList$.value) {
    //         this.openConversationModals();
    //       }
    //     }
    //   });

    this._chatFacade.getConversations$()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap(data => {
          this.conversations$ = of(data);
          this.isChatBtn();
        })).subscribe();

    this.specialistsPointCount();
    this.isRobot();
  }

  public getSpecialistCard() {
    this._specialistService.getSpecialistCard(this.uuid, this.foundSpecialistsUuid)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        filter((spec) => !!spec.specialist),
        map((spec) => spec.specialist),
        tap((spec) => {
          this.specialistList$.next(spec);
          this.isChatBtn();
          // const questionAnswers = spec.test_answers.map((specialistTestList: any) =>
          //   ({
          //     point: specialistTestList?.point,
          //     correctAnswerCount: specialistTestList?.correctAnswerCount,
          //     wrongAnswerCount: specialistTestList?.wrongAnswerCount,
          //     typeOfQuiz: specialistTestList?.interview_test?.["typeOfQuiz"],
          //     testUuid: specialistTestList?.questionAnswerList.testUuid,
          //     title: specialistTestList?.questionAnswerList.title,
          //     interviewTest: specialistTestList?.interview_test,
          //     categoryType: specialistTestList?.interview_test?.["specialist_skill_type"]?.name
          //   }));
          //
          // this.groupByTypeOfQuiz = questionAnswers.reduce((group: ObjectType, product: ObjectType) => {
          //   const {typeOfQuiz} = product;
          //   if (typeOfQuiz) {
          //     group[typeOfQuiz] = group[typeOfQuiz] ?? [];
          //     group[typeOfQuiz].push(product);
          //   }
          //   return group;
          // }, {});
          //
          //
          // this.groupByCategoryOfPsychological =
          //   questionAnswers.reduce((group: ObjectType, product: ObjectType) => {
          //     const {interviewTest} = product;
          //     const {typeOfQuiz} = product;
          //     if (interviewTest?.specialist_skill_type?.name && typeOfQuiz === TestCategory.psychological) {
          //       group[interviewTest?.specialist_skill_type?.name] =
          //         group[interviewTest?.specialist_skill_type?.name] ?? [];
          //
          //       group[interviewTest?.specialist_skill_type?.name] = [];
          //       group[interviewTest?.specialist_skill_type?.name].push(product);
          //     }
          //     return group;
          //   }, []);
          //
          //
          // this.groupByCategoryOfProgramming = questionAnswers.reduce((group: ObjectType, product: ObjectType) => {
          //   const {interviewTest} = product;
          //   const {typeOfQuiz} = product;
          //   if (interviewTest?.specialist_skill_type?.name && typeOfQuiz === TestCategory.programming) {
          //     group[interviewTest?.specialist_skill_type?.name] =
          //       group[interviewTest?.specialist_skill_type?.name] ?? [];
          //     group[interviewTest?.specialist_skill_type?.name].push(product);
          //   }
          //   return group;
          // }, []);
          //
          // return questionAnswers;
        }),
      ).subscribe(() => {
      this.isLoader$.next(false);
    });
  }

  public averagePoint(type: unknown, group: string): number {
    let total = 0;
    let tests = [];
    let length = 0;
    if (group === TestCategory.psychological) {
      length = this.groupByCategoryOfPsychological[<string>type]?.length;
      tests = this.groupByCategoryOfPsychological[<string>type];
    } else {
      length = this.groupByCategoryOfProgramming[<string>type]?.length;
      tests = this.groupByCategoryOfProgramming[<string>type];
    }

    if (length) {
      tests.forEach((item: { point: number; }) =>
        total += item.point ?? 0
      );
      return total / length;
    }

    return 0;
  }

  public inviteSpecialistInChatAction() {
    this.showConfirmationModal$.next(false);

    this.company$
      .pipe(takeUntil(this.ngUnsubscribe),
        switchMap((company) => {
          if (company?.uuid) {
            this._chatFacade.emitConversationCompanyToSpecialist(company.uuid, this.uuid, this.foundSpecialistsUuid);
            if (this.specialistList$.value) {
              this._specialistService.getSpecialistCard(this.uuid, this.foundSpecialistsUuid)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((specialist) => {
                  this._specialistFacade.setSpecialist(specialist?.specialist);
                  this.hideSpecialists();
                  this._chatHelperService.isBottomChatOpen$.next({
                    isOpen: true,
                    isMessagesContent: true,
                  });
                });
            }
          }
          return this._chatFacade.emitGetConversationsRequest();
        })
      )
      .subscribe(conversations => {
        if (!!conversations) {
          this.conversations$ = of(conversations);
          const selectedConv = conversations.find(item =>
            item.other_info.foundSpecialistUuid === this.foundSpecialistsUuid);
          if (selectedConv) {
            this._chatFacade.setConversation(selectedConv);
          }
        }
        this.isChatBtn();
      });
  }

  public hideSpecialists(): void {
    const vacancyId = JSON.parse(this._localStorage.getItem("vacancyId"));
    this._chatFacade.hideOtherSpecialistRequest(
      this.uuid,
      vacancyId
    )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe();
  }

  public isObjectData(object: ObjectType): boolean {
    return Object.keys(object).length !== 0;
  }

  public openTestsList(type: unknown, group: string) {
    if (group === TestCategory.psychological) {
      this.selectedTestsGroup = this.groupByCategoryOfPsychological[<string>type];
    } else {
      this.selectedTestsGroup = this.groupByCategoryOfProgramming[<string>type];
    }
    this._localStorage.setItem("selectedGroupTests", JSON.stringify(this.selectedTestsGroup));
    this._router.navigate([`/specialists/profile/tests`], {queryParams: {uuid: this.uuid}});
  }

  public openSpecialistTest(testUuid?: string): void {
    this._router.navigate([`/specialists/profile/test`], {queryParams: {testId: testUuid, uuid: this.uuid}});
  }

  public rejectStartConversation() {
    this.showConfirmationModal$.next(false);
  }

  public getIsHelper(): boolean {
    if (this._localStorage.getItem("company")) {
      const company = JSON.parse(this._localStorage.getItem("company"));
      const robotHelperChat = company.helper.find((item: { link: string; }) => item.link = "chat-opened");
      return robotHelperChat.hidden;
    }
    return false;
  }

  public openConversationModals(data: boolean): void {
    this.openCandidates.next(false);
    this._chatHelperService.isBottomChatOpen$.next({
      isOpen: false,
      isMessagesContent: false,
    });
    if (data) {
      this.conversations$.pipe(
        take(1),
        takeUntil(this.ngUnsubscribe),
      ).subscribe(conversations => {
        const conversationUuids = conversations.map((item) => {
          return item?.other_info?.foundSpecialistUuid;
        });

        if (this._localStorage.getItem("foundSpecialistUuid")) {
          if (this.specialistList$.value && conversationUuids &&
            conversationUuids.includes(this.foundSpecialistsUuid)) {
            this._specialistFacade.setSpecialist(this.specialistList$.value);
            this._chatHelperService.isBottomChatOpen$.next({
              isOpen: true,
              isMessagesContent: true,
            });
          } else {
            this.isFirstChat$.next(JSON.parse(this._localStorage.getItem("isFirstChat")));
            this.showConfirmationModal$.next(true);
          }
        }
      });
    }
  }

  public isRobot(): void {
    this.company$
      .pipe(filter(data => !!data?.phone))
      .subscribe(data => {
        const specialistProfile = data.helper?.find((item => item.link === "/specialist-info"));

        this._robotHelperService.setRobotSettings({
          content: "Specialist profile - helper",
          navigationItemId: null,
          isContentActive: true,
        });

        if (specialistProfile && !specialistProfile?.hidden) {
          this._robotHelperService.setRobotSettings({
            content: "Specialist profile",
            navigationItemId: null,
            isContentActive: true,
            uuid: specialistProfile?.uuid
          });
        }
      });
  }

  public colorForBarPsycho(index: number): string {
    return colorsPsychoTests[index];
  }

  public colorForBarProf(index: number): string {
    return colorsProfTests[index];
  }

  public specialistsPointCount(): void {
    const initialValue = 0;
    this.pointsQuestions$ = of(initialValue);

    //   this.questionAnswers$.pipe(
    //   map((spec) => {
    //
    //     if (spec.length == 0) {
    //       return 0;
    //     }
    //     const pointCount = spec.reduce((first, second) => {
    //       return second.point ? first + +second?.point : 0;
    //     }, initialValue);
    //
    //     return Math.floor(pointCount / spec.length);
    //   }),
    // );
  }

  public startChat(): void {
    this._localStorage.setItem("foundSpecialistUuid", JSON.stringify(this.foundSpecialistsUuid));
    const company = JSON.parse(this._localStorage.getItem("company"));
    const checkChatStartStatusIndex =
      company.helper?.findIndex((item: { [x: string]: string }) => item["link"] === "chat-opened") ?? -1;

    if (company.helper && checkChatStartStatusIndex >= 0 && !company.helper[checkChatStartStatusIndex].hidden) {
      // this._chatFacade.setCandidatesPopupStatus(true);
      this.openCandidates.next(true);
    } else {
      // this._chatFacade.setCandidatesPopupStatus(false);
      this.openCandidates.next(false);
      this.openConversationModals(true);
    }

    // this._chatFacade.getCandidatesPopupStatus$()
    //   .pipe(takeUntil(this.ngUnsubscribe))
    //   .subscribe(data => {
    //     this.openCandidates.next(data);
    //     if (!data) {
    //       if (this.specialistList$.value) {
    //         this.openConversationModals();
    //       }
    //     }
    //   });
  }

  public isChatBtn() {
    const specialist = this.specialistList$.value;
    if (specialist && (specialist.found_specialist_for_company_rejected.length === 1
      || specialist.found_specialist_for_company_succeed.length === 1)) {
      this.isChatBtn$.next(false);
    } else {
      this.setBtnText();
      this.isChatBtn$.next(true);
    }
  }

  private setBtnText(): void {
    this.conversations$.pipe(
      takeUntil(this.ngUnsubscribe),
    ).subscribe(conversations => {
      const conversationUuids = conversations.map((item) => {
        return item?.other_info?.foundSpecialistUuid;
      });
      if (conversationUuids &&
        conversationUuids.includes(this.foundSpecialistsUuid)) {
        this.startChatText$.next(StartChatBtnTextEnum.openChat);
      } else {
        this.startChatText$.next(StartChatBtnTextEnum.startChat);
      }
    });
  }

  public updateFavorites(): void {
    this._specialistFacade.updateFavorites(this.foundSpecialistsUuid, !this.isFavorite)
      .pipe(
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe((data: { data: string }) => {
        if (data.data) {
          this.isFavorite = !this.isFavorite;
          this._localStorage.setItem("isFavorite", JSON.stringify(this.isFavorite));
          this._cdr.detectChanges();
        }
      });
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

}


import {Component, OnInit} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import {ButtonTypeEnum} from "src/app/modules/app/constants/button-type.enum";
import * as DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";
import {ActivatedRoute, Router} from "@angular/router";
import {AddVacancyInterfaceOrNull} from "src/app/modules/vacancy/interfaces/add-vacancy-filter.interface";
import {VacancyFacade} from "../../vacancy.facade";
import {CreateVacancyForm} from "../../form";
import {BehaviorSubject, catchError, Observable, of, Subject, switchMap, takeUntil, tap, throwError} from "rxjs";
import {LocalStorageService} from "../../../app/services/local-storage.service";
import {CompanyFacade} from "../../../company/company.facade";
import {HomeLayoutState} from "../../../home/home-layout/home-layout.state";
import {RoutesEnum} from "../../../app/constants/routes.enum";
import {CompanyInterface} from "../../../app/interfaces/company.interface";
import {RobotHelperService} from "../../../app/services/robot-helper.service";
import {ObjectType} from "../../../../shared-modules/types/object.type";
import {price, QuestionForInterview} from "../../mock";
import {InputStatusEnum} from "../../../app/constants/input-status.enum";
import {DatePipe} from "@angular/common";
import {ToastModel} from "../../../app/model/toast.model";
import {ToastsService} from "../../../app/services/toasts.service";
import {StatusTypeEnum} from "../../../app/constants/status-type.enum";
import {NavigateButtonFacade} from "../../../../ui-kit/navigate-button/navigate-button.facade";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

export class Questions {
  question: string | undefined;
}

@Component({
  selector: "hr-add-vacancy-description",
  templateUrl: "./create-vacancy-information.component.html",
  styleUrls: ["./create-vacancy-information.component.scss"],
  providers: [DatePipe]
})
export class CreateVacancyInformationComponent implements OnInit {
  public readonly Routes = RoutesEnum;

  public updateProgressBar: Subject<AddVacancyInterfaceOrNull> =
    new Subject<AddVacancyInterfaceOrNull>();

  public buttonTypesList = ButtonTypeEnum;
  public vacancyFormGroup!: FormGroup;
  public cardForm!: FormGroup;
  public isPaidModalOpen = false;
  public isPostponeModalOpen = false;
  public isNotificationModalOpen = false;
  public isPaidChooseModalOpen = false;
  public isCardInfoModalOpen = false;
  public salary = price;
  public progress = 0;
  public Editor: any = DecoupledEditor;
  public editorConfig = {
    toolbar: {
      items: [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "blockQuote",
        "bulletedList",
        "link",
      ],
    },
  };

  public paymentType!: string;

  public vacancyUuId: string = "";

  public date: null | Date = null;

  private multiselectFields = [
    "programmingFrameworks",
    "programmingLanguages",
    "nativeLanguages",
    "wayOfWorking",
  ];

  public isRobotHelper: Observable<boolean> = this._homeLayoutState.getIsRobotHelper$();

  public inputStatusList = InputStatusEnum;

  public questionsFields: Questions[] = [
    {question: ""}
  ];

  public QuestionForInterview = QuestionForInterview;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly _vacancyFacade: VacancyFacade,
    private readonly _companyFacade: CompanyFacade,
    private readonly _localStorage: LocalStorageService,
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly activeRoute: ActivatedRoute,
    private readonly vacancyForm: CreateVacancyForm,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _datePipe: DatePipe,
    private readonly _toastService: ToastsService,
    private readonly _navigateButtonFacade: NavigateButtonFacade,
  ) {
    this.activeRoute.queryParams.subscribe((params) => {
      this.vacancyUuId = params["uuid"];
    });
  }

  public downloadPdf() {
    const content: { text?: string; style?: string; ul?: string[]; }[] = [];
    QuestionForInterview.forEach(questionSet => {
      content.push(
        {text: questionSet.language, style: "language"},
        {text: questionSet.frameworks.join(", "), style: "frameworks"}
      );
      questionSet.questions.forEach(question => {
        if (question.title) {
          content.push(
            {text: question.title, style: "questionTitle"}
          );
        }
        content.push(
          {ul: question.questions, style: "questions"}
        );
      });
      content.push({text: "\n"});
    });

    const documentDefinition: any = {
      content: content,
      styles: {
        language: {alignment: "center", bold: true, fontSize: 14, margin: [0, 10]},
        frameworks: {alignment: "center", fontSize: 12, margin: [0, 5]},
        questionTitle: {fontSize: 12, bold: true, margin: [0, 5]},
        questions: {margin: [0, 5]}
      }
    };

    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
    pdfDocGenerator.download("interview_questions.pdf");
  }

  public autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = textarea.scrollHeight + "px";
  }

  public addInputField(): void {
    const isEmptyField = this.questionsFields.filter(item => {
      return item.question === "";
    });

    if (!isEmptyField.length) {
      this.questionsFields.push({question: ""});
    }
  }

  public get isAddQuestionDisable(): boolean {
    const isEmptyField = this.questionsFields.filter(item => {
      return item.question === "";
    });
    return !!isEmptyField.length;
  }

  public removeInputField(index: number): void {
    if (this.questionsFields.length > 1) {
      this.questionsFields.splice(index, 1);
    }
  }

  public ngOnInit(): void {
    this.vacancyFormGroup = this.vacancyForm.formGroup;
    this.cardForm = this.formBuilder.group({
      cardTypeForm: this.formBuilder.group({
        cardType: ["", Validators.required],
      }),
      cardNumber: [
        null,
        [
          Validators.required,
          Validators.minLength(16),
          Validators.maxLength(16),
        ],
      ],
      cardMonth: [
        null,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(2),
          Validators.max(12),
        ],
      ],
      cardYear: [
        null,
        [Validators.required, Validators.minLength(2), Validators.maxLength(2)],
      ],
      cardCvv: [
        null,
        [Validators.required, Validators.minLength(3), Validators.maxLength(3)],
      ],
    });

    if (!!this._localStorage.getItem("create_vacancy_form")) {
      this.vacancyFormGroup.patchValue(
        JSON.parse(this._localStorage.getItem("create_vacancy_form"))
      );
    } else {
      this.vacancyFormGroup.reset();
    }

    this.vacancyFormGroup.valueChanges.subscribe((value) => {
      this.updateProgressBar.next(value);
    });

    if (this.vacancyUuId) {
      this._vacancyFacade.getVacancy(this.vacancyUuId).subscribe((res) => {
        this.vacancyFormGroup.patchValue(res);
      });
    }
  }

  private prepareFormForRequest(formFields: ObjectType): ObjectType {
    const transformedFormValue = {...formFields};
    for (const field in formFields) {
      if (field) {
        transformedFormValue[field] = (formFields[field] as ObjectType[]).map(
          (value) => value["value"]
        );
        if (!this.multiselectFields.includes(field)) {
          transformedFormValue[field] = transformedFormValue[field].join("");
        }
      }
    }
    return transformedFormValue;
  }

  public company!: Observable<CompanyInterface>;

  public onFormSubmit(form: FormGroup): void {

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });

    if (form.valid && !this.isError.value) {
      const vacancyData = {
        ...this.vacancyFormGroup.value,
        ...{
          searchedSettings: this.prepareFormForRequest(
            this.vacancyFormGroup.value.searchedSettings
          ),
          // payedStatus: "notPayed",
          status: true,
        },
      };

      const date = new Date();

      vacancyData.deadlineDate = date.setDate(date.getDate() + +vacancyData.deadlineDate + 1);
      vacancyData.deadlineDate = this._datePipe.transform(date, "YYYY-MM-dd");

      vacancyData.searchedSettings.wayOfWorking = vacancyData.searchedSettings.wayOfWorking[0].displayName;
      vacancyData.salary = +vacancyData.salary;
      vacancyData.valute = vacancyData.valute[0].displayName;

      if (this.questionsFields?.length) {
        vacancyData.searchedSettings.questions = this.questionsFields.map(data => data.question);
      } else {
        vacancyData.searchedSettings.questions = [];
      }

      this._vacancyFacade.saveVacancy(vacancyData)
        .pipe(
          catchError((err) => {
            this._toastService.addToast({title: ToastModel.reject});
            this._toastService.setStatus$(StatusTypeEnum.failed);
            return throwError(err);
          }),
          switchMap(res => {
            if (res) {
              this._toastService.addToast({title: ToastModel.accepted});
              return this._vacancyFacade.getVacanciesBySearchCriteria({
                ...vacancyData,
                ...{uuid: res.uuid},
              });
            }
            return of(null);
          }),
          switchMap((result) => {
            const navigationBtns = this._navigateButtonFacade.getShowedNavigationsMenu();
            if (navigationBtns) {
              const currentBtnIndex = navigationBtns.findIndex(btn => btn.id === 3);
              if (currentBtnIndex > -1) {
                navigationBtns[currentBtnIndex].statusType = "default";
              }
              this._navigateButtonFacade.setShowedNavigationsMenu$(navigationBtns);
            }
            return of(result);
          }),
          switchMap(result => {
            if (result) {
              const company = JSON.parse(this._localStorage.getItem("company"));
              if (company) {
                const allVacanciesNavigationIndex =
                  company.helper?.findIndex((data: { [x: string]: string; }) => data["link"] === this.Routes.vacancies + "/isActive") ?? -1;
                if (company?.helper && allVacanciesNavigationIndex > -1
                  && !company.helper[allVacanciesNavigationIndex]["hidden"]) {
                  company.helper[allVacanciesNavigationIndex]["hidden"] = true;
                  this._localStorage.setItem("company", JSON.stringify(company));
                  this._vacancyFacade.completeVacancyCreate(true);
                  return this._companyFacade.updateCurrentPageRobot(
                    company.helper[allVacanciesNavigationIndex]["uuid"]);
                }
              }
              return of(null);
            }
            return of(null);
          })).subscribe(() => {
        this.router.navigateByUrl(this.Routes.vacancies);
      });
    }

    this.questionsFields = [{question: ""}];
    this.date = null;
    this._localStorage.removeData("create_vacancy_form");
    this.vacancyFormGroup.reset();
    this.vacancyFormGroup.get("searchedSettings")?.reset();
  }

  get vacancyCompanyNameControl(): FormControl {
    return this.vacancyFormGroup.get("name") as FormControl;
  }

  get vacancyCompletionDateControl(): FormControl {
    return this.vacancyFormGroup.get("deadlineDate") as FormControl;
  }

  get vacancySalaryIncomeControl(): FormControl {
    return this.vacancyFormGroup.get("salary") as FormControl;
  }

  get vacancyCurrencyIncomeControl(): FormControl {
    return this.vacancyFormGroup.get("valute") as FormControl;
  }

  get vacancyDescriptionControl(): FormControl {
    return this.vacancyFormGroup.get("description") as FormControl;
  }

  get vacancyDutiesControl(): FormControl {
    return this.vacancyFormGroup.get("responsibility") as FormControl;
  }

  get vacancyConditionsControl(): FormControl {
    return this.vacancyFormGroup.get("conditions") as FormControl;
  }

  get vacancyQuestionsControl(): FormControl {
    return this.vacancyFormGroup.get("questions") as FormControl;
  }

  get cardTypeControl(): FormControl {
    return this.cardForm.controls["cardTypeForm"].get(
      "cardType"
    ) as FormControl;
  }

  get cardNumberControl(): FormControl {
    return this.cardForm.get("cardNumber") as FormControl;
  }

  get cardMonthControl(): FormControl {
    return this.cardForm.get("cardMonth") as FormControl;
  }

  get cardYearControl(): FormControl {
    return this.cardForm.get("cardYear") as FormControl;
  }

  get cardCvvControl(): FormControl {
    return this.cardForm.get("cardCvv") as FormControl;
  }

  public isError: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public onReady(editor: any) {
    editor.ui
      .getEditableElement()
      .parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }

  public paidModal(val?: boolean): void {
    this.isPaidModalOpen = val !== undefined ? val : !this.isPaidModalOpen;
  }

  public postponeModal(val?: boolean): void {
    this.isPaidModalOpen = false;
    this.isPostponeModalOpen =
      val !== undefined ? val : !this.isPostponeModalOpen;
  }

  public paidChooseModal(val?: boolean): void {
    // this.isPaidModalOpen = false;
    // this.isPaidChooseModalOpen = (val !== undefined) ? val : !this.isPaidChooseModalOpen;
    this._vacancyFacade.getVacanciesBySearchCriteria(
      this.vacancyFormGroup.value
    );
  }

  public cardInfoModal(val?: boolean): void {
    if (this.cardTypeControl.valid) {
      this.isPaidChooseModalOpen = false;
      this.isCardInfoModalOpen =
        val !== undefined ? val : !this.isCardInfoModalOpen;
      this.paymentType = this.cardForm.value.cardTypeForm["cardType"];
    }
  }

  public notificationModal(val?: boolean): void {
    if (this.cardForm.valid) {
      this.isCardInfoModalOpen = false;
      this.isNotificationModalOpen =
        val !== undefined ? val : !this.isNotificationModalOpen;
    }
    this.router.navigateByUrl("/vacancies").then(() => {
    });
  }

}

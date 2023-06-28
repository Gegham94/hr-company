import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from "@angular/core";
import {
  FormControl,
  FormGroup,
} from "@angular/forms";
import * as DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";
import {ActivatedRoute, Router} from "@angular/router";
import {IAddVacancyOrNullType} from "src/app/modules/vacancy/interfaces/add-vacancy-filter.interface";
import {VacancyFacade} from "../../services/vacancy.facade";
import {CreateVacancyForm} from "../../form";
import {Subject, takeUntil} from "rxjs";
import {LocalStorageService} from "../../../../shared/services/local-storage.service";
import {RoutesEnum} from "../../../../shared/enum/routes.enum";
import {ObjectType} from "../../../../shared/types/object.type";
import {price} from "../../mock";
import {InputStatusEnum} from "../../../../shared/enum/input-status.enum";
import {DatePipe} from "@angular/common";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import {Unsubscribe} from "../../../../shared/unsubscriber/unsubscribe";
import {Questions} from "../../interfaces/questions.interface";

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: "hr-add-vacancy-description",
  templateUrl: "./create-vacancy-information.component.html",
  styleUrls: ["./create-vacancy-information.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})
export class CreateVacancyInformationComponent extends Unsubscribe implements OnInit, OnDestroy {
  public readonly Routes = RoutesEnum;

  public updateProgressBar: Subject<IAddVacancyOrNullType> =
    new Subject<IAddVacancyOrNullType>();

  public vacancyFormGroup!: FormGroup;
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

  public vacancyUuId: string = "";

  private multiselectFields: string[] = [
    "programmingFrameworks",
    "programmingLanguages",
    "nativeLanguages",
    "wayOfWorking",
  ];

  public inputStatusList = InputStatusEnum;

  public questionsFields: Questions[] = [
    {question: ""}
  ];

  constructor(
    private readonly _router: Router,
    private readonly _vacancyFacade: VacancyFacade,
    private readonly _localStorage: LocalStorageService,
    private readonly _activeRoute: ActivatedRoute,
    private readonly _vacancyForm: CreateVacancyForm,
    private readonly _datePipe: DatePipe,
  ) {
    super();
    this._activeRoute.queryParams.pipe(takeUntil(this.ngUnsubscribe))
    .subscribe((params) => {
      this.vacancyUuId = params["uuid"];
    });
  }

  public ngOnInit(): void {
    this.vacancyFormGroup = this._vacancyForm.formGroup;

    if (!!this._localStorage.getItem("create_vacancy_form")) {
      this.vacancyFormGroup.get("searchedSettings")?.patchValue(
        JSON.parse(this._localStorage.getItem("create_vacancy_form"))
      );
      this.vacancyFormGroup.updateValueAndValidity({emitEvent: true});
    } else {
      this.vacancyFormGroup.reset();
    }

    this.vacancyFormGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
    .subscribe((value) => {
      this.updateProgressBar.next(value);
    });

    if (this.vacancyUuId) {
      this._vacancyFacade.getVacancy(this.vacancyUuId).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        this.vacancyFormGroup.patchValue(res);
      });
    }
  }

  public downloadPdf() {
    const languagesAndFrames = this.vacancyFormGroup.value.searchedSettings.programmingFrameworks.reduce(
      (group: ObjectType, framework: ObjectType) => {
        const {programmingLanguage} = framework;
        if (programmingLanguage) {
          group[programmingLanguage.uuid] = group[programmingLanguage.uuid] ?? [];
          group[programmingLanguage.uuid].push(framework["id"]);
        }
        return group;
      },
      {}
    );

    this._vacancyFacade.getQuestions$(this._vacancyFacade.getConvertData(languagesAndFrames))
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe();
  }

  public autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = textarea.scrollHeight + "px";
  }

  public addInputField(): void {
    const isEmptyField = this.questionsFields.filter(item => item.question === "");
    if (!isEmptyField.length) {
      this.questionsFields.push({question: ""});
    }
  }

  public removeInputField(index: number): void {
    if (this.questionsFields.length > 1) {
      this.questionsFields.splice(index, 1);
    }
  }

  public onFormSubmit(form: FormGroup): void {

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });

    if (form.valid) {
      this._vacancyFacade.getSubmit$(
        this._vacancyFacade.getTransformedVacancyData(this.vacancyFormGroup, this.questionsFields, this.multiselectFields, this._datePipe),
        this.Routes)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this._router.navigateByUrl(this.Routes.vacancies);
      });
    }

    this.questionsFields = [{question: ""}];
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

  public get isAddQuestionDisable(): boolean {
    const isEmptyField = this.questionsFields.filter(item => item.question === "");
    return !!isEmptyField.length;
  }

  public onReady(editor: any) {
    editor.ui.getEditableElement()
      .parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }

  public ngOnDestroy() {
    this.unsubscribe();
  }
}

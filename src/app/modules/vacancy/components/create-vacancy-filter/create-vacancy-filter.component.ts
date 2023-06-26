import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { ButtonTypeEnum } from "src/app/modules/app/constants/button-type.enum";
import { AbstractControl, FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { BehaviorSubject, filter, Observable, of, Subject, switchMap, takeUntil } from "rxjs";
import { VacancyFacade } from "../../vacancy.facade";
import { CreateVacancyForm } from "../../form";
import { VacancyFormFieldNames, VacancyFormFields } from "../../constants/vacancy-form-fields.enum";
import { AddVacancyInterfaceOrNull } from "../../interfaces/add-vacancy-filter.interface";
import { LocalStorageService } from "../../../app/services/local-storage.service";
import {
  SearchableSelectDataInterface,
  StringOrNumber,
} from "../../../app/interfaces/searchable-select-data.interface";
import { Unsubscribe } from "src/app/shared-modules/unsubscriber/unsubscribe";
import { HomeLayoutState } from "../../../home/home-layout/home-layout.state";
import { CompanyInterface } from "../../../app/interfaces/company.interface";
import { RobotHelperService } from "../../../app/services/robot-helper.service";
import { RoutesEnum } from "../../../app/constants/routes.enum";

export const formFields = [
  { controlName: "country", groupName: "searchedSettings" },
  { controlName: "city", groupName: "searchedSettings" },
  { controlName: "vacancyLevel", groupName: "searchedSettings" },
  { controlName: "workplace", groupName: "searchedSettings" },
  { controlName: "programmingLanguages", groupName: "searchedSettings" },
  { controlName: "programmingFrameworks", groupName: "searchedSettings" },
  { controlName: "nativeLanguages", groupName: "searchedSettings" },
  { controlName: "wayOfWorking", groupName: "searchedSettings" },
];

@Component({
  selector: "hr-create-vacancy-filter",
  templateUrl: "./create-vacancy-filter.component.html",
  styleUrls: ["./create-vacancy-filter.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateVacancyFilterComponent extends Unsubscribe implements OnInit, OnDestroy {
  @Input("edit") edit: boolean = false;

  public formFields = formFields;
  public buttonTypesList = ButtonTypeEnum;
  public vacancyFormFields = VacancyFormFields;
  public vacancyFormGroup: FormGroup = this.createVacancyForm.formGroup;
  public updateProgressBar: Subject<AddVacancyInterfaceOrNull> = new Subject<AddVacancyInterfaceOrNull>();
  // FIXME: loader is never true
  public isSelectionLoader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public programmingLanguageOptions$!: Observable<SearchableSelectDataInterface[] | null>;
  public frameworkOptions$: Observable<SearchableSelectDataInterface[] | null> =
    this._vacancyFacade.getProgrammingFrameworksRequest$();
  public skillLevelOptions$: Observable<SearchableSelectDataInterface[]> = this._vacancyFacade.getProgrammingLevels$();
  public workplaceOptions$: Observable<SearchableSelectDataInterface[]> = this._vacancyFacade.getWorkplace$();
  public languageOptions$: Observable<SearchableSelectDataInterface[]> = this._vacancyFacade.getLanguages$();
  public employmentTypeOptions$: Observable<SearchableSelectDataInterface[]> =
    this._vacancyFacade.getEmploymentTypes$();
  public cityOptions$: Observable<SearchableSelectDataInterface[] | null> =
    this._vacancyFacade.getVacancyLocationCitiesRequest$();
  public countryOptions$: Observable<SearchableSelectDataInterface[] | null> =
    this._vacancyFacade.getVacancyLocationCountriesRequest$();

  private selectedProgrammingLanguagesBackup: StringOrNumber[] = [];
  public isRobotHelper: Observable<boolean> = this._homeLayoutState.getIsRobotHelper$();
  public isRobotMap: Observable<boolean> = this._homeLayoutState.getIsRobotMap();
  public isChooseModalOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get isCityDisabled(): boolean {
    return !Boolean(
      this.createVacancyForm.getFormControl("country", "searchedSettings").value &&
        this.createVacancyForm.getFormControl("country", "searchedSettings").value.length
    );
  }

  get getTagsList(): boolean {
    const tags = this.formFields.filter((data: { controlName: string; groupName: string }) => {
      return this.createVacancyForm.getFormControl(data.controlName, data.groupName).valid;
    });
    return Boolean(tags.length);
  }

  get isInValid(): boolean {
    return this.vacancyFormGroup.controls["searchedSettings"].invalid;
  }

  constructor(
    public readonly createVacancyForm: CreateVacancyForm,
    private readonly _vacancyFacade: VacancyFacade,
    private readonly _localStorage: LocalStorageService,
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly _robotHelperService: RobotHelperService,
    private readonly router: Router
  ) {
    super();
  }

  public ngOnInit(): void {
    this.vacancyFormGroup = this.createVacancyForm.formGroup;
    if (Boolean(this._localStorage.getItem("create_vacancy_form"))) {
      this.vacancyFormGroup.patchValue(JSON.parse(this._localStorage.getItem("create_vacancy_form")));

      ["programmingFrameworks", "programmingLanguages", "nativeLanguages"].forEach((item) => {
        if (!Array.isArray(this.createVacancyForm.getFormControl(item, "searchedSettings").value)) {
          this.createVacancyForm
            .getFormControl(item, "searchedSettings")
            ?.setValue(this.createVacancyForm.getFormControl(item, "searchedSettings").value.split(", "), {
              emitEvent: true,
            });
        }
      });
    } else {
      this.vacancyFormGroup.reset();
    }

    this.vacancyFormGroup.updateValueAndValidity({ emitEvent: true });

    this.countryChange();
    this.programmingLanguageChange();

    this._vacancyFacade.setLocationCountriesRequest$({});
    this._vacancyFacade.setAllProgrammingLanguagesRequest$().subscribe(() => {
      this.programmingLanguageOptions$ = this._vacancyFacade.getAllProgrammingLanguages();
    });

    this.vacancyFormGroup.controls["searchedSettings"].valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((value) => {
        this.updateProgressBar.next(value);
      });

    if (this.router.url.includes("payment")) {
      this.isChooseModalOpen.next(true);
    } else {
      this.isRobot();
    }
  }

  public company$: Observable<CompanyInterface> = of(JSON.parse(this._localStorage.getItem("company")));

  public isRobot() {
    this.company$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        filter((data) => !!data?.phone)
      )
      .subscribe((data) => {
        const vacancyCreateFilter = data.helper?.find((item) => item.link === "/vacancy/create-filter");
        const vacancyCreateInformation = data.helper?.find((item) => item.link === "/vacancy/create-information");

        if (this.router.url === "/vacancy/create-information") {
          this._robotHelperService.setRobotSettings({
            content: "Create vacancy - helper",
            navigationItemId: null,
            isContentActive: true,
          });

          if (vacancyCreateInformation && !vacancyCreateInformation?.hidden) {
            this._robotHelperService.setRobotSettings({
              content: "Create vacancy",
              navigationItemId: null,
              isContentActive: true,
              uuid: vacancyCreateInformation.uuid,
            });
            this._robotHelperService.isRobotOpen$.next(true);
          }
        }

        if (this.router.url.includes("/vacancy/create-filter")) {
          this._robotHelperService.setRobotSettings({
            content: `/vacancy/create-filter - helperContrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.`,
            navigationItemId: null,
            isContentActive: true,
          });
          if (vacancyCreateFilter && !vacancyCreateFilter?.hidden) {
            this._robotHelperService.setRobotSettings({
              content: "create vacancy filter",
              navigationItemId: null,
              isContentActive: true,
              uuid: vacancyCreateFilter.uuid,
            });
            this._robotHelperService.isRobotOpen$.next(true);
          }
        }
      });
  }

  public getFormControlByName(controlName: string): FormControl {
    return this.createVacancyForm.getFormControl(controlName, "searchedSettings");
  }

  public checkIsRobot(): void {
    window.history.pushState({}, document.title, window.location.pathname);
    this.isRobot();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  private countryChange(): void {
    this.createVacancyForm
      .getFormControl("country", "searchedSettings")
      ?.valueChanges.pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((selectedCountry: SearchableSelectDataInterface[]) => {
          if (selectedCountry && selectedCountry.length) {
            const uuId = selectedCountry[0].id as string;
            return this._vacancyFacade.setLocationCitiesRequest$({ countryId: uuId }, false);
          } else {
            this.createVacancyForm.getFormControl("city", "searchedSettings").setValue("");
            return this._vacancyFacade.setLocationCitiesRequest$({ countryId: undefined }, true);
          }
        })
      )
      .subscribe();
  }

  private programmingLanguageChange(): void {
    this.createVacancyForm
      .getFormControl("programmingLanguages", "searchedSettings")
      ?.valueChanges.pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((selectedProgrammingLanguages: SearchableSelectDataInterface[]) => {
          if (
            selectedProgrammingLanguages &&
            selectedProgrammingLanguages.length &&
            selectedProgrammingLanguages.every((language) =>
              this.selectedProgrammingLanguagesBackup.includes(language.id)
            )
          ) {
            const selectedLanguageIds = selectedProgrammingLanguages.map((language) => language.id);
            let selectedFrameworks: SearchableSelectDataInterface[] | null = this.createVacancyForm.getFormControl(
              "programmingFrameworks",
              "searchedSettings"
            ).value;
            if (selectedFrameworks) {
              selectedFrameworks = selectedFrameworks.filter((framework) =>
                selectedLanguageIds.includes(framework.programmingLanguage?.uuid as StringOrNumber)
              );
            }

            this.createVacancyForm
              .getFormControl("programmingFrameworks", "searchedSettings")
              .setValue(selectedFrameworks);
            return this._vacancyFacade.addProgrammingFrameworks(
              {
                programmingLanguageUuids: JSON.stringify([...selectedLanguageIds]),
              },
              true
            );
          }
          if (selectedProgrammingLanguages && selectedProgrammingLanguages.length) {
            this.selectedProgrammingLanguagesBackup = selectedProgrammingLanguages.map((language) => language.id);
            const uuIds = selectedProgrammingLanguages.map((selectedLanguage) => selectedLanguage.id) as string[];
            return this._vacancyFacade.addProgrammingFrameworks(
              { programmingLanguageUuids: JSON.stringify([...uuIds]) },
              true
            );
          } else {
            this.createVacancyForm.getFormControl("programmingFrameworks", "searchedSettings").setValue(null);
            return of([]);
          }
        })
      )
      .subscribe();
  }

  public updateFrameworks(deletedLanguage: SearchableSelectDataInterface): void {
    let selectedFrameworks: SearchableSelectDataInterface[] = this.createVacancyForm.getFormControl(
      "programmingFrameworks",
      "searchedSettings"
    ).value;
    selectedFrameworks = selectedFrameworks.filter(
      (framework) => framework.programmingLanguage?.uuid !== deletedLanguage.id
    );
    this.createVacancyForm.getFormControl("programmingFrameworks", "searchedSettings").setValue(selectedFrameworks);
  }

  public getFieldName(field: string): string {
    return this.vacancyFormFields[field as keyof VacancyFormFieldNames];
  }

  public vacancyElementValue(
    controlName: FormControl,
    deleteValue?: string | SearchableSelectDataInterface,
    fieldName?: string
  ) {
    if (Array.isArray(controlName.value)) {
      controlName.setValue(controlName.value.filter((val) => val !== deleteValue));
    } else {
      controlName.setValue("");
    }
    if (deleteValue === "country") {
      this.createVacancyForm.getFormControl("city", "searchedSettings").setValue("");
      this.createVacancyForm.formGroup.updateValueAndValidity({
        emitEvent: true,
      });
    }
    if (deleteValue && fieldName === this.vacancyFormFields.programmingLanguages) {
      this.updateFrameworks(deleteValue as SearchableSelectDataInterface);
    }
  }

  public isArray(vacancy: unknown): boolean {
    return typeof vacancy === "object";
  }

  public sendVacancyValue(vacancyForm: AbstractControl) {
    if (vacancyForm.valid) {
      this._localStorage.setItem("create_vacancy_form", JSON.stringify(vacancyForm.value));
      this._vacancyFacade.saveFilter(vacancyForm.value);
      this.router.navigate(["/vacancy/create-information"]);
    }
  }
}

import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {ButtonTypeEnum} from "src/app/shared/enum/button-type.enum";
import {AbstractControl, FormControl, FormGroup} from "@angular/forms";
import {Router} from "@angular/router";
import {
  BehaviorSubject,
  filter,
  Observable,
  of,
  pairwise,
  Subject,
  switchMap,
  takeUntil,
} from "rxjs";
import {VacancyFacade} from "../../services/vacancy.facade";
import {CreateVacancyForm} from "../../form";
import {VacancyFormFields} from "../../constants/vacancy-form-fields.enum";
import {IAddVacancyOrNullType} from "../../interfaces/add-vacancy-filter.interface";
import {LocalStorageService} from "../../../../shared/services/local-storage.service";
import {
  ISearchableSelectData,
  StringOrNumberType,
} from "../../../../shared/interfaces/searchable-select-data.interface";
import {Unsubscribe} from "src/app/shared/unsubscriber/unsubscribe";
import {HomeLayoutState} from "../../../home/home-layout/home-layout.state";
import {ICompany} from "../../../../shared/interfaces/company.interface";
import {RobotHelperService} from "../../../../shared/services/robot-helper.service";
import {CompanyFacade} from "../../../company/services/company.facade";

export const formFields = [
  {controlName: "country", groupName: "searchedSettings"},
  {controlName: "city", groupName: "searchedSettings"},
  {controlName: "vacancyLevel", groupName: "searchedSettings"},
  {controlName: "workplace", groupName: "searchedSettings"},
  {controlName: "programmingLanguages", groupName: "searchedSettings"},
  {controlName: "programmingFrameworks", groupName: "searchedSettings"},
  {controlName: "nativeLanguages", groupName: "searchedSettings"},
  {controlName: "wayOfWorking", groupName: "searchedSettings"},
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
  public updateProgressBar: Subject<IAddVacancyOrNullType> = new Subject<IAddVacancyOrNullType>();
  // FIXME: loader is never true
  public isSelectionLoader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public programmingLanguageOptions$!: Observable<ISearchableSelectData[] | null>;
  public frameworkOptions$: Observable<ISearchableSelectData[] | null> =
    this._vacancyFacade.getProgrammingFrameworksRequest$();
  public skillLevelOptions$: Observable<ISearchableSelectData[]> = this._vacancyFacade.getProgrammingLevels$();
  public workplaceOptions$: Observable<ISearchableSelectData[]> = this._vacancyFacade.getWorkplace$();
  public languageOptions$: Observable<ISearchableSelectData[]> = this._vacancyFacade.getLanguages$();
  public employmentTypeOptions$: Observable<ISearchableSelectData[]> =
    this._vacancyFacade.getEmploymentTypes$();
  public cityOptions$: Observable<ISearchableSelectData[] | null> =
    this._vacancyFacade.getVacancyLocationCitiesRequest$();
  public countryOptions$: Observable<ISearchableSelectData[] | null> =
    this._vacancyFacade.getVacancyLocationCountriesRequest$();

  private selectedProgrammingLanguagesBackup: StringOrNumberType[] = [];
  public isRobotHelper: Observable<boolean> = this._homeLayoutState.getIsRobotHelper$();
  public isRobotMap: Observable<boolean> = this._homeLayoutState.getIsRobotMap();
  public isChooseModalOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public company$: Observable<ICompany> = this._companyFacade.getCompanyData$();

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
    private readonly _companyFacade: CompanyFacade,
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _router: Router
  ) {
    super();
  }

  public ngOnInit(): void {
    this.vacancyFormGroup = this.createVacancyForm.formGroup;

    this.vacancyFormGroup.updateValueAndValidity({ emitEvent: true });

    this.countryChange();
    this.programmingLanguageChange();

    this._vacancyFacade.setLocationCountriesRequest$({})
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe();
    this._vacancyFacade.setAllProgrammingLanguagesRequest$().subscribe(() => {
      this.programmingLanguageOptions$ = this._vacancyFacade.getAllProgrammingLanguages();
    });

    this.vacancyFormGroup.controls["searchedSettings"].valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((value) => {
        this.updateProgressBar.next(value);
      });

    if (this._router.url.includes("payment")) {
      this.isChooseModalOpen.next(true);
    } else {
      this.isRobot();
    }
  }

  public isRobot() {
    this.company$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        filter((data) => !!data?.phone)
      )
      .subscribe((data) => {
        const vacancyCreateFilter = data.helper?.find((item) => item.link === "/vacancy/create-filter");
        const vacancyCreateInformation = data.helper?.find((item) => item.link === "/vacancy/create-information");

        if (this._router.url === "/vacancy/create-information") {
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

        if (this._router.url.includes("/vacancy/create-filter")) {
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

  public sendVacancyValue(vacancyForm: AbstractControl) {
    if (vacancyForm.valid) {
      this._localStorage.setItem("create_vacancy_form", JSON.stringify(vacancyForm.value));
      this._router.navigate(["/vacancy/create-information"]);
    }
  }

  private programmingLanguageChange(): void {
    this.createVacancyForm
      .getFormControl("programmingLanguages", "searchedSettings")
      ?.valueChanges.pipe(
      takeUntil(this.ngUnsubscribe),
      switchMap((selectedProgrammingLanguages: ISearchableSelectData[]) => {
        this.isSelectionLoader.next(true);
        if (
          selectedProgrammingLanguages &&
          selectedProgrammingLanguages.length &&
          selectedProgrammingLanguages.every((language) =>
            this.selectedProgrammingLanguagesBackup.includes(language.id)
          )
        ) {
          const selectedLanguageIds = selectedProgrammingLanguages.map((language) => language.id);
          let selectedFrameworks: ISearchableSelectData[] | null = this.createVacancyForm.getFormControl(
            "programmingFrameworks",
            "searchedSettings"
          ).value;
          if (selectedFrameworks) {
            selectedFrameworks = selectedFrameworks.filter((framework) =>
              selectedLanguageIds.includes(framework.programmingLanguage?.uuid as StringOrNumberType)
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
            {programmingLanguageUuids: JSON.stringify([...uuIds])},
            true
          );
        } else {
          this.createVacancyForm.getFormControl("programmingFrameworks", "searchedSettings").setValue(null);
          return of([]);
        }
      })
    )
      .subscribe(() => {
        this.isSelectionLoader.next(false);
      });
  }

  private countryChange(): void {
    this.createVacancyForm
      .getFormControl("country", "searchedSettings")
      ?.valueChanges.pipe(
      takeUntil(this.ngUnsubscribe),
      pairwise(),
      switchMap(([prev, selectedCountry]) => {
        this.isSelectionLoader.next(true);
        if (prev?.length && prev[0]?.id !== selectedCountry[0]?.id) {
          this.createVacancyForm.getFormControl("city", "searchedSettings").setValue("");
        }
        if (selectedCountry && selectedCountry.length) {
          const uuId = selectedCountry[0].id as string;
          return this._vacancyFacade.setLocationCitiesRequest$({countryId: uuId}, false);
        } else {
          return this._vacancyFacade.setLocationCitiesRequest$({countryId: undefined}, true);
        }
      })
    )
      .subscribe(() => {
        this.isSelectionLoader.next(false);
      });
  }
}

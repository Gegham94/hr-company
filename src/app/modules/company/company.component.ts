import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {FormGroup} from "@angular/forms";
import * as DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";
import {CompanyFacade} from "./company.facade";
import {CompanyForm} from "./form";
import {InputStatusEnum} from "../app/constants/input-status.enum";
import {VacancyFacade} from "../vacancy/vacancy.facade";
import {CompanyInterface} from "../app/interfaces/company.interface";
import {phone_number_prefix} from "../app/constants";
import {
  BehaviorSubject,
  catchError,
  concatMap,
  debounceTime,
  filter,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  takeUntil,
  tap,
  throwError,
} from "rxjs";
import {HomeLayoutState} from "../home/home-layout/home-layout.state";
import {RoutesEnum} from "../app/constants/routes.enum";
import {Unsubscribe} from "../../shared-modules/unsubscriber/unsubscribe";
import {ShowLoaderService} from "../app/services/show-loader.service";
import {SearchableSelectDataInterface} from "../app/interfaces/searchable-select-data.interface";
import {ObjectType} from "src/app/shared-modules/types/object.type";
import {LocalStorageService} from "../app/services/local-storage.service";
import {RobotHelperService} from "../app/services/robot-helper.service";
import {CompanyState} from "./company.state";
import {CompanyService} from "./company.service";
import {CompanyInnItemInterface} from "../app/interfaces/company-inn.interface";
import {Router} from "@angular/router";
import {ToastModel} from "../app/model/toast.model";
import {StatusTypeEnum} from "../app/constants/status-type.enum";
import {ToastsService} from "../app/services/toasts.service";
import {NavigateButtonFacade} from "../../ui-kit/navigate-button/navigate-button.facade";

@Component({
  selector: "hr-company-info",
  templateUrl: "./company.component.html",
  styleUrls: ["./company.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyComponent extends Unsubscribe implements OnInit, OnDestroy {
  private companyCurrentValues = this._localStorage.getItem("company")
    ? of(JSON.parse(this._localStorage.getItem("company")) as CompanyInterface)
    : this._companyState.getCompanyData$();
  public isChooseModalOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private readonly Routes = RoutesEnum;
  private initialCompanyDataIndex!: number;
  private isInnRegistered: boolean = false;
  private innFilterChange: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public inputValue!: string;
  public Editor: any = DecoupledEditor;
  public companyRegisterForm = this.companyForm.formGroup;
  public inputStatusList = InputStatusEnum;
  public disabledSendBtn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public isSelectionLoader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isInnLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isInnSelected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  public isInnRegistered$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public searchListCountry$: Observable<SearchableSelectDataInterface[] | null> =
    this._vacancyFacade.getVacancyLocationCountriesRequest$();

  public searchListCity$: Observable<SearchableSelectDataInterface[] | null> =
    this._vacancyFacade.getVacancyLocationCitiesRequest$();

  public getCompanyInn$: BehaviorSubject<SearchableSelectDataInterface[] | null> = new BehaviorSubject<SearchableSelectDataInterface[] | null>(null);

  public companyInfo!: { [key: string]: any };
  private initialCompanyInfoBackup!: { [key: string]: any };
  public isSendCompanyInfo$: Observable<boolean> = of(false);
  public companyInn: CompanyInnItemInterface[] = [];
  public editorConfig = {
    toolbar: {
      items: ["bold", "italic", "underline", "strikethrough", "|", "blockQuote", "bulletedList", "link"],
    },
  };

  public isLogo: BehaviorSubject<boolean | undefined> = new BehaviorSubject<boolean | undefined>(undefined);

  public isRobotHelper: Observable<boolean> = this._homeLayoutState.getIsRobotHelper$();

  public get isCityDisabled(): boolean {
    return !Boolean(
      this.companyForm.getFormControl("country").value && this.companyForm.getFormControl("country").value.length
    );
  }

  public logo(): Observable<string> {
    return this._companyFacade.getCompanyLogo$();
  }

  public readonly formFieldsNumber = Object.keys(this.companyRegisterForm.controls).length;

  constructor(
    public readonly companyForm: CompanyForm,
    private readonly _companyFacade: CompanyFacade,
    private readonly _companyState: CompanyState,
    private readonly _vacancyFacade: VacancyFacade,
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly _showLoaderService: ShowLoaderService,
    private readonly _localStorage: LocalStorageService,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _companyService: CompanyService,
    private readonly _router: Router,
    private readonly _toastService: ToastsService,
    private readonly _loader: ShowLoaderService,
    private readonly _navigateButtonFacade: NavigateButtonFacade,
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }

  public ngOnInit(): void {
    this.companyCurrentValues
      .pipe(
        takeUntil(this.ngUnsubscribe),
        filter((data) => !!data?.phone)
      )
      .subscribe(() => {
        this._vacancyFacade.setLocationCountriesRequest$({});
        this.countryChange();
        this.companyFormFieldChanges();
        this.disabledSendBtnWhenFormFieldIsEqual();
      });

    this.isSendCompanyInfo$ = this._showLoaderService.getSendingCompanyBtn();
    this.searchCompanyByInn()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((innItem) => {
        this.getCompanyInn$.next(innItem);
        this.isInnLoading$.next(false);
      });

    this.companyForm
      .getFormControl("logo")
      ?.valueChanges.pipe(
        takeUntil(this.ngUnsubscribe),
        tap(() => {
          this.isLogo.next(true);
        })
      )
      .subscribe();

    if (this._router.url.includes("payment")) {
      this.isChooseModalOpen.next(true);
    } else {
      this.isRobot();
    }

    this.companyRegisterForm.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap(() => {
          if (
            this.getValidFieldLength() === this.formFieldsNumber - 1 &&
            this.companyRegisterForm.get("logo")?.invalid
          ) {
            this.isLogo.next(false);
          }
        })
      )
      .subscribe();
  }

  public checkIsRobot(): void {
    window.history.pushState({}, document.title, window.location.pathname);
    this.isRobot();
  }

  // INN functionality
  public searchByInn(query: string): void {
    if (!query.length) {
      this.getCompanyInn$.next(null);
      if (this.initialCompanyInfoBackup["inn"]) {
        this.companyRegisterForm.patchValue(this.initialCompanyInfoBackup);
      }
      this.companyForm.getFormControl("inn").setValue("");
      this.companyForm.getFormControl("inn").setErrors({invalidValue: true});
      this.companyRegisterForm.updateValueAndValidity({
        emitEvent: true,
      });
    }

    if (query.length >= 4 && query.length <= 10) {
      this.getCompanyInn$.next(null);
      this.isInnLoading$.next(true);
      this.companyForm.getFormControl("inn").setErrors({});
    } else {
      this.companyForm.getFormControl("inn").setErrors({});
      this.isInnLoading$.next(false);
    }
    this.innFilterChange.next(query);
  }

  private searchCompanyByInn(): Observable<SearchableSelectDataInterface[] | null> {
    return this.innFilterChange.pipe(
      debounceTime(500),
      map((query) => {
        if (query.length >= 4 && query.length <= 10) {
          return {query, isOk: true};
        }
        return {query, isOk: false};
      }),
      filter((res) => res.isOk),
      switchMap((res) =>
        this._companyService.getCompanyInn(res.query).pipe(
          map((inn) => {
            if (inn.result.length === 0) {
              return null;
            }
            return inn.result.map((item, index) => ({
              id: index,
              value: item.inn,
              displayName: item.value,
              innItem: inn.result[index],
            }));
          })
        )
      )
    );
  }

  private isRobot() {
    this._robotHelperService.isRobotOpen$.next(false);

    this.companyCurrentValues.pipe(filter((data) => !!data?.phone)).subscribe((data) => {
      const company = data.helper?.find((item: { link: string }) => item.link === "/company");
      const companyIsActive = data.helper?.find((item: { link: string }) => item.link === "/company/isActive");
      const companyAfterSave = data.helper?.find((item: { link: string }) => item.link === "/company-after-save");

      if (company?.hidden && data?.helper) {
        if (companyIsActive && companyIsActive?.hidden) {
          this._robotHelperService.setRobotSettings({
            content: "Company after save - helper",
            navigationItemId: 2,
            isContentActive: false,
            uuid: companyAfterSave?.uuid,
          });
        } else {
          this._robotHelperService.setRobotSettings({
            content: "Company - helper",
            navigationItemId: null,
            isContentActive: true,
          });
        }
      } else {
        this._robotHelperService.setRobotSettings({
          content: "Company - helper",
          navigationItemId: null,
          isContentActive: true,
        });
      }

      if (company && !company?.hidden) {
        this._robotHelperService.setRobotSettings({
          content: "Company",
          navigationItemId: null,
          isContentActive: true,
          uuid: company.uuid,
        });
        this._robotHelperService.isRobotOpen$.next(true);
      }
    });
  }

  public ngOnDestroy(): void {
    this.companyRegisterForm.reset();
    this.unsubscribe();
  }

  public onFormSubmit(form: FormGroup, isDisabled: boolean, event: any): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

    if (!isDisabled && event.detail === 1) {
      const formData = {
        ...this.changeFormForRequest(form.value),
        companyNumber: phone_number_prefix + form.value.companyNumber,
      };

      // if (!this.companyRegisterForm.get("logo")?.value) {
      //   this.isLogo.next(false);
      //   return;
      // }

      if (this.companyRegisterForm.valid) {
        this._companyFacade
          .updateCompany(formData)
          .pipe(
            takeUntil(this.ngUnsubscribe),
            catchError((err) => {
              if (err.error.statusCode === 424) {
                this._toastService.addToast({title: err.error.message});
                this.companyForm.getFormControl("email").reset();
                this.companyForm.getFormControl("email").updateValueAndValidity({emitEvent: true});
                this.companyForm.getFormControl("email").markAsTouched();
              } else {
                this._toastService.addToast({title: ToastModel.reject});
              }
              this._toastService.setStatus$(StatusTypeEnum.failed);
              return throwError(() => new Error(err));
            }),
            switchMap((companyRaw: CompanyInterface | null) => {
              if (companyRaw) {
                if (companyRaw.logo) {
                  this._companyState.setCompanyLogo$(companyRaw.logo);
                }
                this._loader.sendingLoaderFormCompany();
                return this._companyFacade.setCompanyData$();
              }
              return of(null);
            }),
            switchMap((companyRaw: CompanyInterface | null) => {
              const navigationBtns = this._navigateButtonFacade.getShowedNavigationsMenu();
              if (navigationBtns) {
                const currentBtnIndex = navigationBtns.findIndex((btn) => btn.id === 2);
                const balancetBtnIndex = navigationBtns.findIndex((btn) => btn.id === 6);
                if (currentBtnIndex > -1) {
                  navigationBtns[currentBtnIndex].statusType = "default";
                  navigationBtns[balancetBtnIndex].statusType = "default";
                }
                this._navigateButtonFacade.setShowedNavigationsMenu$(navigationBtns);
              }
              return of(companyRaw);
            }),
            switchMap((company) => {
              if (!!company) {
                this.companyCurrentValues = of(JSON.parse(this._localStorage.getItem("company")));
                this.companyFormFieldChanges();

                return this.companyCurrentValues;
              }
              return of(null);
            }),
            switchMap((company: CompanyInterface | null) => {
              if (company) {
                const companyPageIndex =
                  company.helper?.findIndex((data) => data["link"] === this.Routes.company + "/isActive") ?? -1;
                const createVacancyPageIndex =
                  company.helper?.findIndex((data) => data["link"] === this.Routes.vacancyCreateFilter + "/isActive") ??
                  -1;
                const balancePageIndex =
                  company.helper?.findIndex((data) => data["link"] === this.Routes.balance + "/isActive") ?? -1;
                const companyAfterSave = company.helper?.find(
                  (item: { link: string }) => item.link === "/company-after-save"
                );

                if (!companyAfterSave?.hidden) {
                  this._robotHelperService.setRobotSettings({
                    content: "Company after save",
                    navigationItemId: 2,
                    isContentActive: false,
                    uuid: companyAfterSave?.uuid,
                    link: "/company-after-save",
                  });
                  this._robotHelperService.isRobotOpen$.next(true);

                  if (company?.helper && companyPageIndex >= 0 && createVacancyPageIndex >= 0) {
                    company.helper[companyPageIndex]["hidden"] = true;
                    company.helper[createVacancyPageIndex]["hidden"] = true;
                    company.helper[balancePageIndex]["hidden"] = true;
                    this._localStorage.setItem("company", JSON.stringify(company));
                    return forkJoin([
                      this._companyFacade.updateCurrentPageRobot(company.helper[companyPageIndex]["uuid"]),
                      this._companyFacade.updateCurrentPageRobot(company.helper[createVacancyPageIndex]["uuid"]),
                      this._companyFacade.updateCurrentPageRobot(company.helper[balancePageIndex]["uuid"]),
                    ]);
                  }
                }
                this._router.navigateByUrl("/vacancy/create-filter");
              }
              return of(null);
            })
          )
          .subscribe((result) => {
            this.isInnRegistered$.next(true);
            const company: CompanyInterface =
              this._localStorage.getItem("company") && JSON.parse(this._localStorage.getItem("company"));
            this.companyRegisterForm.get("inn")?.setValue(company.inn);
            this.companyRegisterForm.updateValueAndValidity({emitEvent: true});
          });
      }
    }
    // this._router.navigate(["/vacancy/create-filter"]);
  }

  public onReady(editor: any): void {
    editor.ui
      .getEditableElement()
      .parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
  }

  private countryChange(): void {
    this.companyForm
      .getFormControl("country")
      ?.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.ngUnsubscribe),
      switchMap((selectedCountry: SearchableSelectDataInterface[] | string) => {
        if (typeof this.companyForm.getFormControl("city").value !== "string") {
          this.companyForm.getFormControl("city").setValue("");
        }
        if (typeof selectedCountry !== "string" && selectedCountry && selectedCountry.length) {
          const uuId = selectedCountry[0].id as string;
          return this._vacancyFacade.setLocationCitiesRequest$({countryId: uuId}, false);
        }
        return of(null);
      })
    )
      .subscribe();
  }

  public getValidFieldLength() {
    const validFormData: boolean[] = [];
    Object.keys(this.companyRegisterForm.controls).forEach((key) => {
      const control = this.companyRegisterForm.get(key);
      if (control && control.valid) {
        validFormData.push(true);
      }
    });
    return validFormData.length;
  }

  private disabledSendBtnWhenFormFieldIsEqual(): void {
    this.companyRegisterForm.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap((companyFromData) => {
          companyFromData["inn"] = this.companyInfo["inn"];
          const isEqual = [];
          if (this._localStorage.getItem("company")) {
            const company = JSON.parse(this._localStorage.getItem("company"));
            for (const companyFromDataKey in companyFromData) {
              if (company.inn) {
                if (typeof companyFromData[companyFromDataKey] === "string") {
                  companyFromData[companyFromDataKey] === this.companyInfo[companyFromDataKey]
                    ? isEqual.push(true)
                    : isEqual.push(false);
                } else {
                  companyFromData[companyFromDataKey] &&
                  companyFromData[companyFromDataKey][0] &&
                  companyFromData[companyFromDataKey][0].value == this.companyInfo[companyFromDataKey]
                    ? isEqual.push(true)
                    : isEqual.push(false);
                }
              } else {
                isEqual.push(false);
              }
            }
            this.disabledSendBtn$.next(isEqual.every((el) => !!el));
            this.cdr.detectChanges();
          }
        })
      )
      .subscribe();
  }

  private changeFormForRequest(formValues: ObjectType): any {
    for (const key in formValues) {
      if (formValues.hasOwnProperty(key)) {
        if (key === "country") {
          if(typeof this.companyRegisterForm.getRawValue().country === "string") {
            formValues[key] = this.companyRegisterForm.getRawValue().country;
          } else {
            formValues[key] = this.companyRegisterForm.getRawValue().country[0].displayName;
          }
        }
        if (key === "city") {
          if(typeof this.companyRegisterForm.getRawValue().city === "string") {
            formValues[key] = this.companyRegisterForm.getRawValue().city;
          } else {
            formValues[key] = this.companyRegisterForm.getRawValue().city[0].displayName;
          }
        }
      }
    }

    return formValues;
  }

  private companyFormFieldChanges(): void {
    this.companyCurrentValues
      .pipe(
        takeUntil(this.ngUnsubscribe),
        concatMap((value, index) => {
          if (index === this.initialCompanyDataIndex) {
            return of(value);
          }
          if (Object.keys(value).length) {
            return of(value).pipe(
              tap((initvalue) => {
                this.initialCompanyDataIndex = index;
                this.initialCompanyInfoBackup = initvalue;
              })
            );
          }
          return of(value);
        }),
        map((data: CompanyInterface) => {
          if (data.phone) {
            this.companyInfo = {
              description: data.description,
              logo: data.logo,
              phone: data.phone,
              uuid: data.uuid,
              webSiteLink: data.webSiteLink,
              inn: data?.inn,
              address: data?.address,
              city: data?.city,
              country: data?.country,
              email: data?.email,
              name: data?.name,
              ogrn: data?.ogrn,
            };

            this.companyRegisterForm.patchValue(this.companyInfo);
            if (data?.inn) {
              this.isInnRegistered$.next(true);
              this.isInnSelected$.next(false);
              this.isInnRegistered = true;
            }
            this.companyRegisterForm.updateValueAndValidity({
              emitEvent: true,
            });
          }
        }),
        switchMap(() => {
          return this.companyForm.getFormControl("inn").valueChanges.pipe(
            filter((innItem) => {
              if (!innItem || innItem.length === 0) {
                if (!this.isInnRegistered) {
                  this.isInnSelected$.next(true);
                }
              }
              return typeof innItem !== "string" && !!innItem && innItem.length > 0;
            }),
            map((innItem) => {
              innItem.forEach((item: SearchableSelectDataInterface) => {
                const inn = item.innItem;
                this.companyInfo = {
                  address: inn?.address,
                  city: inn?.city,
                  country: inn?.country,
                  name: inn?.value,
                  inn: inn?.inn,
                  ogrn: inn?.ogrn,
                };
                this.isInnSelected$.next(false);
                this.companyRegisterForm.patchValue(this.companyInfo);
                this.companyRegisterForm.updateValueAndValidity({
                  emitEvent: true,
                });
              });
            })
          );
        })
      )
      .subscribe();
  }
}

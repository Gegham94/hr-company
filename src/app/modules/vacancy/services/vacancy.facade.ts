import { Injectable, OnDestroy } from "@angular/core";
import { VacancyState } from "./vacancy.state";
import { VacancyService } from "./vacancy.service";
import { catchError, distinctUntilChanged, map, Observable, of, switchMap, tap, throwError } from "rxjs";
import {
  IFilterRecourseLocationCities,
  IFilterRecourseLocationCountries,
  IFilterRecourseProgrammingFrameworks,
  IFilterRecourseProgrammingLanguages,
} from "../interfaces/filter-recourse.interface";
import { IAddVacancy } from "../../../shared/interfaces/add-vacancy.interface";
import { convertLocalDateTime } from "../../../shared/helpers/date.helper";
import { ISearchableSelectData, StringOrNumberType } from "../../../shared/interfaces/searchable-select-data.interface";
import { ObjectType } from "../../../shared/types/object.type";
import { Specialist } from "../../specialists/interfaces/specialist.interface";
import { IMyVacancyFilter } from "../interfaces/my-vacancy-filter.interface";
import { ISearchParams } from "../interfaces/search-params.interface";
import { ToastsService } from "../../../shared/services/toasts.service";
import { IVacancy } from "../../../shared/interfaces/vacancy.interface";
import { TranslateService } from "@ngx-translate/core";
import { IGetQuestions, ISendLanguages, Questions } from "../interfaces/questions.interface";
import { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import pdfMake from "pdfmake/build/pdfmake";
import { ToastModel } from "../../../shared/enum/toast.model.enum";
import { StatusTypeEnum } from "../../../shared/enum/status-type.enum";
import { NavigateButtonFacade } from "src/app/ui-kit/navigate-button/navigate-button.facade";
import { CompanyFacade } from "../../company/services/company.facade";
import { FormGroup } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { BalanceService } from "../../balance/services/balance.service";
import { SpecialistFacade } from "../../specialists/services/specialist.facade";
import { IAnalyticData } from "../../analytic/interfaces/vacancy-analytics.interface";
import { ICompany } from "src/app/shared/interfaces/company.interface";

@Injectable({
  providedIn: "root",
})
export class VacancyFacade implements OnDestroy {
  constructor(
    private _vacancyService: VacancyService,
    private _balanceService: BalanceService,
    private _vacancyState: VacancyState,
    private _specialistFacade: SpecialistFacade,
    private _toastService: ToastsService,
    private _translateService: TranslateService,
    private _navigateButtonFacade: NavigateButtonFacade,
    private _companyFacade: CompanyFacade
  ) {}

  public ngOnDestroy(): void {
    this._specialistFacade.destroyGetSpecialistsNotificationCount();
  }

  public saveVacancy(vacancy: IAddVacancy) {
    return this._vacancyService.saveVacancy(vacancy);
  }

  public getVacancy(vacancyUuId: StringOrNumberType): Observable<IAddVacancy> {
    return this._vacancyService.getVacancy(vacancyUuId);
  }

  public updateVacancy(vacancyData: IAddVacancy): Observable<boolean> {
    vacancyData.deadlineDate = convertLocalDateTime(new Date(vacancyData.deadlineDate).toLocaleDateString());
    return this._vacancyService.updateVacancy(vacancyData);
  }

  public getAllVacancy(take: number, searchParams?: IMyVacancyFilter): Observable<IAddVacancy> {
    return this._balanceService.getAllVacancies(take, searchParams);
  }

  public getVacanciesForSelection(searchParams: {
    status: string;
    payedStatus: string;
  }): Observable<ISearchableSelectData[]> {
    return this._balanceService.getVacanciesForSelection(searchParams).pipe(
      map((data) => {
        return data.map((item: { name: string; uuid: string }) => {
          return {
            id: item.uuid,
            value: item.name,
            displayName: item.name,
          };
        });
      })
    );
  }

  public getFilteredVacancy(end: number, searchParams?: IMyVacancyFilter): Observable<ISearchableSelectData[]> {
    return this._balanceService.getAllVacancies(end, searchParams).pipe(
      map((data: IAddVacancy) => {
        return data["result"].map((item: IAddVacancy) => {
          return {
            id: item.uuid,
            value: item.name,
            displayName: item.name,
            count: data.count,
          };
        });
      })
    );
  }

  public getVacancie(uuid: StringOrNumberType): Observable<IAddVacancy> {
    return this._balanceService.getVacancieForUuid(uuid);
  }

  public getVacanciesBySearchCriteria(formData: IAddVacancy): Observable<Specialist> {
    return this._vacancyService.getVacanciesBySearchCriteria(formData).pipe(
      tap(() => {
        this._specialistFacade.updateSpecialistsNotificationCount();
      })
    );
  }

  public setAllProgrammingLanguagesRequest$(): Observable<IFilterRecourseProgrammingLanguages> {
    return this._vacancyService.getFilterRecourseProgrammingLanguagesRequest$({}).pipe(
      tap((res: IFilterRecourseProgrammingLanguages) => {
        if (res.data) {
          this._vacancyState.setAllProgrammingLanguages(res);
        }
      })
    );
  }

  public getVacancyLocationCountriesRequest$(): Observable<ISearchableSelectData[] | null> {
    return this._vacancyState.getVacancyLocationCountries$().pipe(
      map((data: IFilterRecourseLocationCountries | null) => {
        if (data) {
          let countries: ISearchableSelectData[] = [];
          data?.data?.map((item: ObjectType) => {
            for (const key in item) {
              if (item.hasOwnProperty(key)) {
                countries.push({
                  id: key,
                  value: item[key],
                  displayName: item[key],
                  count: data["total"],
                });
              }
            }
          });
          countries = countries.sort((countryA, countryB) => {
            return countryA.displayName.toLowerCase() < countryB.displayName.toLowerCase()
              ? -1
              : countryA.displayName.toLowerCase() > countryB.displayName.toLowerCase()
              ? 1
              : 0;
          });
          return countries;
        }
        return null;
      })
    );
  }

  public getVacancyLocationCitiesRequest$(): Observable<ISearchableSelectData[] | null> {
    return this._vacancyState.getVacancyLocationCities$().pipe(
      map((item: IFilterRecourseLocationCities | null) => {
        if (item) {
          let cities: ISearchableSelectData[] = [];
          for (const city in item.data) {
            if (city) {
              cities.push({
                id: city,
                value: item.data[city],
                displayName: item.data[city],
                count: item["total"],
              });
            }
          }
          cities = cities.sort((cityA, cityB) => {
            return cityA.displayName.toLowerCase() < cityB.displayName.toLowerCase()
              ? -1
              : cityA.displayName.toLowerCase() > cityB.displayName.toLowerCase()
              ? 1
              : 0;
          });
          return cities;
        }
        return null;
      })
    );
  }

  public setLocationCitiesRequest$(
    searchParams: ISearchParams,
    reset: boolean
  ): Observable<IFilterRecourseLocationCities | null> {
    if (reset) {
      return of(null);
    }
    return this._vacancyService.getFilterRecourseLocationCitiesRequest$(searchParams).pipe(
      distinctUntilChanged(),
      tap((res: IFilterRecourseLocationCities) => {
        this._vacancyState.setVacancyLocationCities$(res);
      })
    );
  }

  public setProgrammingFrameworksRequest$(
    searchParams: ISearchParams,
    reset: boolean
  ): Observable<IFilterRecourseProgrammingFrameworks> {
    return this._vacancyService.getFilterRecourseProgrammingFrameworksRequest$(searchParams).pipe(
      tap((res: IFilterRecourseProgrammingFrameworks) => {
        if (res.data) {
          this._vacancyState.setVacancyProgrammingFrameworks(res, reset);
        }
      })
    );
  }

  public addProgrammingFrameworks(
    searchParams: ISearchParams,
    reset: boolean
  ): Observable<IFilterRecourseProgrammingFrameworks> {
    return this.setProgrammingFrameworksRequest$(searchParams, reset);
  }

  public setLocationCountriesRequest$(searchParams: ISearchParams): Observable<void> {
   return this._vacancyService.getFilterRecourseLocationCountriesRequest$(searchParams).pipe(
      distinctUntilChanged(),
      map((res: IFilterRecourseLocationCountries) => {
        if (res.data) {
          this._vacancyState.setVacancyLocationCountries$(res);
        }
      })
    )
  }

  public getLanguages$(): Observable<ISearchableSelectData[]> {
    return this._vacancyService.getLanguages$();
  }

  public getEmploymentTypes$(): Observable<ISearchableSelectData[]> {
    return this._vacancyService.getEmploymentTypes$();
  }

  public getProgrammingLevels$(): Observable<ISearchableSelectData[]> {
    return this._vacancyService.getProgrammingLevels$();
  }

  public getWorkplace$(): Observable<ISearchableSelectData[]> {
    return this._vacancyService.getWorkplace$();
  }

  public getProgrammingFrameworksRequest$(): Observable<ISearchableSelectData[] | null> {
    return this._vacancyState.getVacancyProgrammingFrameworks$().pipe(
      map((data: IFilterRecourseProgrammingFrameworks | null) => {
        if (data) {
          let frameworks: ISearchableSelectData[] = [];
          data?.data?.forEach((item) => {
            frameworks.push({
              id: item.uuid ?? "",
              value: item.joinedName ?? "",
              displayName: item.defaultName ?? "",
              count: data.total,
              programmingLanguage: item.programming_language,
            });
          });
          frameworks = frameworks.sort((frameworkA, frameworkB) => {
            return frameworkA.displayName.toLowerCase() < frameworkB.displayName.toLowerCase()
              ? -1
              : frameworkA.displayName.toLowerCase() > frameworkB.displayName.toLowerCase()
              ? 1
              : 0;
          });

          return frameworks;
        }
        return null;
      })
    );
  }

  public getAllProgrammingLanguages(): Observable<ISearchableSelectData[] | null> {
    return this._vacancyState.getAllProgrammingLanguages$().pipe(
      map((data: IFilterRecourseProgrammingLanguages | null) => {
        if (!data) {
          return null;
        }

        return data
          .data!.map((item) => ({
            id: item.uuid ?? "",
            value: item.joinedName ?? "",
            displayName: item.defaultName ?? "",
            count: data.total,
          }))
          .sort((languageA, languageB) =>
            languageA.displayName.toLowerCase().localeCompare(languageB.displayName.toLowerCase())
          );
      })
    );
  }

  public getVacancyAnalytics(uuid: StringOrNumberType): Observable<IAnalyticData> {
    return this._vacancyService.getVacancyAnalytic(uuid);
  }

  public getAllAnalytics(isArchived?: boolean): Observable<IAnalyticData> {
    return this._vacancyService.getAllAnalytic(isArchived);
  }

  public isCompletedVacancyCreate(): Observable<boolean> {
    return this._vacancyState.getIsCompletedVacancyCreate();
  }

  public completeVacancyCreate(value: boolean) {
    this._vacancyState.setIsCompletedVacancyCreate(value);
  }

  public progress(vacancyProps: IVacancy): string {
    let day: number | string;
    if (vacancyProps.payedDate) {
      const deadlineDate: Date = new Date(vacancyProps.deadlineDate);
      day = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24) - 1);
    } else {
      day = "not-payed";
    }
    const days = [2, 3, 4];
    if (day === "not-payed") {
      return "не оплачено";
    } else if ((day as number) < 0) {
      return "завершен";
    } else if (day === 0) {
      return this._translateService.instant("MY_VACANCY.DAY", {
        days: 1,
      });
    } else if (days.includes(<number>day)) {
      return this._translateService.instant("MY_VACANCY.DAYS", {
        days: day,
      });
    }
    return this._translateService.instant("MY_VACANCY.DAYS_INFINITE", {
      days: day,
    });
  }

  public getProgressPercent(vacancyProps: IVacancy): number {
    if (vacancyProps.payedDate) {
      const deadlineDate: Date = new Date(vacancyProps.deadlineDate);
      const payedDate = new Date(vacancyProps.payedDate);
      const allDays = Math.ceil((deadlineDate.getTime() - payedDate.getTime()) / (1000 * 3600 * 24) - 1);
      const stayedDays = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24) - 1);
      return (stayedDays * 100) / allDays;
    } else {
      return 100;
    }
  }

  public getQuestions$(body: ISendLanguages): Observable<IGetQuestions[]> {
    return this._vacancyService.getQuestionsList(body).pipe(
      tap((data) => {
        const content: { text?: string; style?: string; ul?: string[] }[] = [];
        if (data) {
          data.forEach((questionSet: IGetQuestions) => {
            content.push(
              { text: questionSet.language, style: "language" },
              { text: questionSet.frameworks.join(", "), style: "frameworks" }
            );

            questionSet.questions.forEach((question) => {
              if (question.title) {
                content.push({
                  text: question.title === questionSet.language ? "" : question.title,
                  style: "questionTitle",
                });
              }
              content.push({ ul: question.questions, style: "questions" });
            });
            content.push({ text: "\n" });
          });

          const documentDefinition: TDocumentDefinitions = {
            content: content as Content,
            styles: {
              language: { alignment: "center", bold: true, fontSize: 14, margin: [0, 10] },
              frameworks: { alignment: "center", fontSize: 12, margin: [0, 5] },
              questionTitle: { fontSize: 12, bold: true, margin: [0, 5] },
              questions: { margin: [0, 5] },
            },
          };

          const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
          pdfDocGenerator.download("interview_questions.pdf");
        }
      })
    );
  }

  public getConvertData(data: ObjectType): ISendLanguages {
    const convertedData: ISendLanguages = {
      languages: [],
    };
    for (const language in data) {
      if (data.hasOwnProperty(language)) {
        convertedData.languages.push({
          language: language,
          frameworks: data[language],
        });
      }
    }
    return convertedData;
  }

  public getSubmit$(vacancyData: IAddVacancy, Routes: any): Observable<ObjectType | null> {
    return this.saveVacancy(vacancyData).pipe(
      catchError((err) => {
        this._toastService.addToast({ title: ToastModel.reject });
        this._toastService.setStatus$(StatusTypeEnum.failed);
        return throwError(() => new Error(err));
      }),
      switchMap((res) => {
        if (res) {
          this._toastService.addToast({ title: ToastModel.accepted });
          return this.getVacanciesBySearchCriteria({
            ...vacancyData,
            ...{ uuid: res.uuid },
          });
        }
        return of(null);
      }),
      switchMap((result) => {
        const navigationBtns = this._navigateButtonFacade.getShowedNavigationsMenu();
        if (navigationBtns) {
          const currentBtnIndex = navigationBtns.findIndex((btn) => btn.id === 3);
          if (currentBtnIndex > -1) {
            navigationBtns[currentBtnIndex].statusType = "default";
          }
          this._navigateButtonFacade.setShowedNavigationsMenu$(navigationBtns);
        }
        return of(result);
      }),
      switchMap((result) => {
        if (result) {
          const company: ICompany = this._companyFacade.getCompanyData();
          if (company) {
            const allVacanciesNavigationIndex =
              company.helper?.findIndex(
                (data) => data["link"] === Routes.vacancies + "/isActive"
              ) ?? -1;
            if (
              company?.helper &&
              allVacanciesNavigationIndex > -1 &&
              !company.helper[allVacanciesNavigationIndex]["hidden"]
            ) {
              company.helper[allVacanciesNavigationIndex]["hidden"] = true;
              this._companyFacade.updateCompany$(company);
              this.completeVacancyCreate(true);
              return this._companyFacade.updateCurrentPageRobot(company.helper[allVacanciesNavigationIndex]["uuid"]);
            }
          }
          return of(null);
        }
        return of(null);
      })
    );
  }

  public getTransformedVacancyData(
    vacancyFormGroup: FormGroup,
    questionsFields: Questions[],
    multiselectFields: string[],
    datePipe: DatePipe
  ): IAddVacancy {
    const vacancyData = {
      ...vacancyFormGroup.value,
      ...{
        searchedSettings: this.getPrepareFormForRequest(vacancyFormGroup.value.searchedSettings, multiselectFields),
        status: true,
      },
    };

    const date = new Date();
    vacancyData.deadlineDate = date.setDate(date.getDate() + +vacancyData.deadlineDate + 1);
    vacancyData.deadlineDate = datePipe.transform(date, "YYYY-MM-dd");

    vacancyData.searchedSettings.wayOfWorking = vacancyData.searchedSettings.wayOfWorking[0];
    vacancyData.salary = +vacancyData.salary;
    vacancyData.valute = vacancyData.valute[0].displayName;

    if (questionsFields?.length) {
      vacancyData.searchedSettings.questions = questionsFields.map((data) => data.question);
    } else {
      vacancyData.searchedSettings.questions = [];
    }
    return vacancyData;
  }

  private getPrepareFormForRequest(formFields: ObjectType, multiselectFields: string[]): ObjectType {
    const transformedFormValue = { ...formFields };
    for (const field in formFields) {
      if (field) {
        transformedFormValue[field] = (formFields[field] as ObjectType[]).map((value) => value["value"]);

        if (!multiselectFields.includes(field)) {
          transformedFormValue[field] = transformedFormValue[field].join(" ");
        }
      }
    }
    return transformedFormValue;
  }
}

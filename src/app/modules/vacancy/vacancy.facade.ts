import {Injectable} from "@angular/core";
import {VacancyState} from "./vacancy.state";
import {VacancyService} from "./vacancy.service";
import {distinctUntilChanged, map, Observable, of, tap,} from "rxjs";
import {BalanceService} from "../balance/balance.service";
import {CompanyState} from "../company/company.state";
import {
  FilterRecourseLocationCities,
  FilterRecourseLocationCountries,
  FilterRecourseProgrammingFrameworks,
  FilterRecourseProgrammingLanguages,
} from "./interfaces/filter-recourse.interface";
import {AddVacancyInterface} from "../app/interfaces/add-vacancy.interface";
import {convertLocalDateTime} from "../../helpers/date.helper";
import {SearchableSelectDataInterface, StringOrNumber,} from "../app/interfaces/searchable-select-data.interface";
import {ObjectType} from "../../shared-modules/types/object.type";
import {Specialist} from "../specialists/interfaces/specialist.interface";
import {LocalStorageService} from "../app/services/local-storage.service";
import {MyVacancyFilterInterface} from "./interfaces/my-vacancy-filter.interface";
import {AddVacancyFilterInterface} from "./interfaces/add-vacancy-filter.interface";
import {SpecialistState} from "../specialists/specialist.state";
import {AnalyticData} from "../app/interfaces/vacancy-statistic.interface";
import {SpecialistFacade} from "../specialists/specialist.facade";
import {SearchParams} from "./interfaces/search-params.interface";
import {ToastsService} from "../app/services/toasts.service";
import {VacancyInterface} from "../app/interfaces/vacancy.interface";
import {TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: "root",
})
export class VacancyFacade {
  constructor(
    private _addVacancyFilterState: VacancyState,
    private _vacancyService: VacancyService,
    private _balanceService: BalanceService,
    private _companyState: CompanyState,
    private _vacancyState: VacancyState,
    private _specialistState: SpecialistState,
    private _specialistFacade: SpecialistFacade,
    private _localStorage: LocalStorageService,
    private _toastService: ToastsService,
    private _translateService: TranslateService
  ) {
  }

  public getCitiesByCountry(
    searchParams: SearchParams,
    country: string,
    reset: boolean
  ): void {
    const countries = this.vacancyLocationCountriesSubject;
    countries?.data?.forEach((item: FilterRecourseLocationCountries) => {
      for (const key in item) {
        // @ts-ignore
        if (item.hasOwnProperty(key) && item[key] === country) {
          searchParams["countryId"] = key;
          // this.setLocationCitiesRequest$(searchParams, reset).subscribe();
        }
      }
    });
  }

  public saveFilter(saveFilter: AddVacancyFilterInterface) {
    this._addVacancyFilterState.addFilterData(saveFilter);
  }

  public getVacancyFilter() {
    return this._addVacancyFilterState.vacancyFilterSubject;
  }

  public saveVacancy(vacancy: AddVacancyInterface) {
    return this._vacancyService.saveVacancy(vacancy);
  }

  public getVacancy(
    vacancyUuId: StringOrNumber
  ): Observable<AddVacancyInterface> {
    return this._vacancyService.getVacancy(vacancyUuId);
  }

  public updateVacancy(vacancyData: AddVacancyInterface): Observable<boolean> {
    vacancyData.deadlineDate = convertLocalDateTime(
      new Date(vacancyData.deadlineDate).toLocaleDateString()
    );
    return this._vacancyService.updateVacancy(vacancyData);
  }

  public getAllVacancy(
    take: number,
    searchParams?: MyVacancyFilterInterface
  ): Observable<AddVacancyInterface> {
    return this._balanceService.getAllVacancies(take, searchParams);
  }

  public getVacanciesForSelection(searchParams: { status: string, payedStatus: string }):
    Observable<SearchableSelectDataInterface[]> {
    return this._balanceService.getVacanciesForSelection(searchParams).pipe(
      map((data) => {
        return data.map((item: { name: string, uuid: string }) => {
          return {
            id: item.uuid,
            value: item.name,
            displayName: item.name,
          };
        });
      })
    );
  }

  public getFilteredVacancy(
    end: number,
    searchParams?: MyVacancyFilterInterface
  ): Observable<SearchableSelectDataInterface[]> {
    return this._balanceService.getAllVacancies(end, searchParams).pipe(
      map((data: AddVacancyInterface) => {
        return data["result"].map((item: AddVacancyInterface) => {
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

  public getVacancie(uuid: StringOrNumber): Observable<AddVacancyInterface> {
    return this._balanceService.getVacancieForUuid(uuid);
  }

  public getVacanciesBySearchCriteria(
    formData: AddVacancyInterface
  ): Observable<Specialist> {
    return this._vacancyService.getVacanciesBySearchCriteria(formData).pipe(
      tap(() => {
        this._specialistFacade.updateSpecialistsNotificationCount();
      })
    );
  }

  public getVacancyProgrammingLanguagesSubject(): FilterRecourseProgrammingLanguages {
    return this._vacancyState.vacancyProgrammingLanguagesSubject;
  }

  public getVacancyProgrammingFrameworksSubject(): FilterRecourseProgrammingFrameworks | null {
    return this._vacancyState.vacancyProgrammingFrameworksSubject;
  }

  public get vacancyLocationCountriesSubject(): FilterRecourseLocationCountries | null {
    return this._vacancyState.vacancyLocationCountriesSubject;
  }

  public setProgrammingLanguagesRequest$(
    searchParams: SearchParams,
    reset: boolean
  ): Observable<FilterRecourseProgrammingLanguages> {
    return this._vacancyService
      .getFilterRecourseProgrammingLanguagesRequest$(searchParams)
      .pipe(
        tap((res: FilterRecourseProgrammingLanguages) => {
          if (res.data) {
            this._vacancyState.setVacancyProgrammingLanguages(res, reset);
          }
        })
      );
  }

  public setAllProgrammingLanguagesRequest$(): Observable<FilterRecourseProgrammingLanguages> {
    return this._vacancyService
      .getFilterRecourseProgrammingLanguagesRequest$({})
      .pipe(
        tap((res: FilterRecourseProgrammingLanguages) => {
          if (res.data) {
            this._vacancyState.setAllProgrammingLanguages(res);
          }
        })
      );
  }

  public getVacancyLocationCountriesRequest$(): Observable<SearchableSelectDataInterface[] | null> {
    return this._vacancyState.getVacancyLocationCountries$().pipe(
      map((data: FilterRecourseLocationCountries | null) => {
        if (data) {
          let countries: SearchableSelectDataInterface[] = [];
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
            return countryA.displayName.toLowerCase() <
            countryB.displayName.toLowerCase()
              ? -1
              : countryA.displayName.toLowerCase() >
              countryB.displayName.toLowerCase()
                ? 1
                : 0;
          });
          return countries;
        }
        return null;
      })
    );
  }

  public getVacancyLocationCitiesRequest$(): Observable<SearchableSelectDataInterface[] | null> {
    return this._vacancyState.getVacancyLocationCities$().pipe(
      map((item: FilterRecourseLocationCities | null) => {
        if (item) {
          let cities: SearchableSelectDataInterface[] = [];
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
              : cityA.displayName.toLowerCase() >
              cityB.displayName.toLowerCase()
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
    searchParams: SearchParams,
    reset: boolean
  ): Observable<FilterRecourseLocationCities | null> {
    if (reset) {
      return of(null);
    }
    return this._vacancyService
      .getFilterRecourseLocationCitiesRequest$(searchParams)
      .pipe(
        distinctUntilChanged(),
        tap((res: FilterRecourseLocationCities) => {
          this._vacancyState.setVacancyLocationCities$(res);
        })
      );
  }

  public setProgrammingFrameworksRequest$(
    searchParams: SearchParams,
    reset: boolean
  ): Observable<FilterRecourseProgrammingFrameworks> {
    return this._vacancyService
      .getFilterRecourseProgrammingFrameworksRequest$(searchParams)
      .pipe(
        tap((res: FilterRecourseProgrammingFrameworks) => {
          if (res.data) {
            this._vacancyState.setVacancyProgrammingFrameworks(res, reset);
          }
        })
      );
  }

  public setAllProgrammingFrameworksRequest$(
    data: string[],
    searchParams: ObjectType = {}
  ): Observable<FilterRecourseProgrammingFrameworks> {
    searchParams = {};
    const filteredData =
      this.getVacancyProgrammingLanguagesSubject()?.data?.filter(
        (lang) => lang.defaultName && data.indexOf(lang?.defaultName) > -1
      );
    let ids: (string | undefined)[] = [];
    if (filteredData) {
      ids = filteredData.map((xx) => xx.uuid);
    }
    if (!!ids.length) {
      searchParams["programmingLanguageUuids"] = JSON.stringify(ids);
    } else {
      this._vacancyState.setAllProgrammingFrameworks({total: 0, data: []});
      return of({total: 0, data: []});
    }

    return this._vacancyService
      .getFilterRecourseProgrammingFrameworksRequest$(searchParams)
      .pipe(
        tap((res: FilterRecourseProgrammingFrameworks) => {
          if (res.data) {
            this._vacancyState.setAllProgrammingFrameworks(res);
          }
        })
      );
  }

  public addProgrammingFrameworks(
    searchParams: SearchParams,
    reset: boolean
  ): Observable<FilterRecourseProgrammingFrameworks> {
    return this.setProgrammingFrameworksRequest$(searchParams, reset);
  }

  public getProgrammingLanguagesRequest$(): Observable<SearchableSelectDataInterface[]> {
    return this._vacancyState.getVacancyProgrammingLanguages().pipe(
      map((data: FilterRecourseProgrammingLanguages) => {
        const languages: SearchableSelectDataInterface[] = [];
        data?.data?.map((item) => {
          languages.push({
            id: item.uuid ?? "",
            value: item.joinedName ?? "",
            displayName: item.defaultName ?? "",
            count: data["total"],
          });
        });
        return languages;
      })
    );
  }

  public setLocationCountriesRequest$(searchParams: SearchParams): void {
    this._vacancyService
      .getFilterRecourseLocationCountriesRequest$(searchParams)
      .pipe(distinctUntilChanged())
      .subscribe((res: FilterRecourseLocationCountries) => {
        if (res.data) {
          this._vacancyState.setVacancyLocationCountries$(res);
        }
      });
  }

  public getLanguages$(): Observable<SearchableSelectDataInterface[]> {
    return this._vacancyService.getLanguages$();
  }

  public getEmploymentTypes$(): Observable<SearchableSelectDataInterface[]> {
    return this._vacancyService.getEmploymentTypes$();
  }

  public getProgrammingLevels$(): Observable<SearchableSelectDataInterface[]> {
    return this._vacancyService.getProgrammingLevels$();
  }

  public getWorkplace$(): Observable<SearchableSelectDataInterface[]> {
    return this._vacancyService.getWorkplace$();
  }

  public getProgrammingFrameworksRequest$(): Observable<SearchableSelectDataInterface[] | null> {
    return this._vacancyState.getVacancyProgrammingFrameworks().pipe(
      map((data: FilterRecourseProgrammingFrameworks | null) => {
        if (data) {
          let frameworks: SearchableSelectDataInterface[] = [];
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
            return frameworkA.displayName.toLowerCase() <
            frameworkB.displayName.toLowerCase()
              ? -1
              : frameworkA.displayName.toLowerCase() >
              frameworkB.displayName.toLowerCase()
                ? 1
                : 0;
          });

          return frameworks;
        }
        return null;
      })
    );
  }

  public getAllProgrammingLanguages(): Observable<SearchableSelectDataInterface[] | null> {
    return this._vacancyState.getAllProgrammingLanguages().pipe(
      map((data: FilterRecourseProgrammingLanguages | null) => {
        if (data) {
          let languages: SearchableSelectDataInterface[] = [];
          data?.data?.map((item) => {
            languages.push({
              id: item.uuid ?? "",
              value: item.joinedName ?? "",
              displayName: item.defaultName ?? "",
              count: data["total"],
            });
          });
          languages = languages.sort((languageA, languageB) => {
            return languageA.displayName.toLowerCase() <
            languageB.displayName.toLowerCase()
              ? -1
              : languageA.displayName.toLowerCase() >
              languageB.displayName.toLowerCase()
                ? 1
                : 0;
          });
          return languages;
        }
        return null;
      })
    );
  }

  public getAllProgrammingFrameworks(): Observable<SearchableSelectDataInterface[]> {
    return this._vacancyState.getAllProgrammingFrameworks().pipe(
      map((data: FilterRecourseProgrammingFrameworks) => {
        let frameworks: SearchableSelectDataInterface[] = [];
        data?.data?.map((item) => {
          frameworks.push({
            id: item.uuid ?? "",
            value: item.joinedName ?? "",
            displayName: item.defaultName ?? "",
            programmingLanguage: item.programming_language,
          });
        });
        frameworks = frameworks.sort((frameworkA, frameworkB) => {
          return frameworkA.displayName.toLowerCase() <
          frameworkB.displayName.toLowerCase()
            ? -1
            : frameworkA.displayName.toLowerCase() >
            frameworkB.displayName.toLowerCase()
              ? 1
              : 0;
        });
        return frameworks;
      })
    );
  }

  public getVacancyAnalytics(uuid: StringOrNumber): Observable<AnalyticData> {
    return this._vacancyService.getVacancyAnalytic(uuid);
  }

  public getAllAnalytics(isArchived?: boolean): Observable<AnalyticData> {
    return this._vacancyService.getAllAnalytic(isArchived);
  }

  public isCompletedVacancyCreate(): Observable<boolean> {
    return this._vacancyState.getIsCompletedVacancyCreate();
  }

  public completeVacancyCreate(value: boolean) {
    this._vacancyState.setIsCompletedVacancyCreate(value);
  }

  public progress(vacancyProps: VacancyInterface): string {
    let day: number | string;
    if (vacancyProps.payedDate) {
      const deadlineDate: Date = new Date(vacancyProps.deadlineDate);
      day = Math.ceil(((deadlineDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)) - 1);
    } else {
      day = "not-payed";
    }
    const days = [2, 3, 4];
    if(day === "not-payed") {
      return "не оплачено";
    } else if (day < 0) {
      return "завершен";
    } else if (day === 0) {
      return this._translateService.instant("MY_VACANCY.DAY", {
        days: 1
      });
    } else if (days.includes(<number>day)) {
      return this._translateService.instant("MY_VACANCY.DAYS", {
        days: day
      });
    }
    return this._translateService.instant("MY_VACANCY.DAYS_INFINITE", {
      days: day
    });
  }

  public getProgressPercent(vacancyProps: VacancyInterface): number {
    if (vacancyProps.payedDate) {
      const deadlineDate: Date = new Date(vacancyProps.deadlineDate);
      const payedDate = new Date(vacancyProps.payedDate);
      const allDays = Math.ceil(((deadlineDate.getTime() - payedDate.getTime()) / (1000 * 3600 * 24)) - 1);
      const stayedDays = Math.ceil(((deadlineDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)) - 1);
      return (stayedDays * 100) / allDays;
    } else {
      return 100;
    }
  }
}

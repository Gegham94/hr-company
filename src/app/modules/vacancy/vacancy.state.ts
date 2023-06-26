import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import {
  FilterRecourseLocationCities,
  FilterRecourseLocationCountries,
  FilterRecourseProgrammingFrameworks,
  FilterRecourseProgrammingLanguages,
} from "./interfaces/filter-recourse.interface";
import { AddVacancyFilterInterface } from "./interfaces/add-vacancy-filter.interface";
import { AddVacancyInterface } from "../app/interfaces/add-vacancy.interface";
import { VacancyInterface } from "../app/interfaces/vacancy.interface";
import { BalanceTariffInterface } from "../app/interfaces/balance-tariff.interface";

@Injectable({
  providedIn: "root",
})
export class VacancyState {
  public vacancyFilterSubject: Subject<AddVacancyFilterInterface> =
    new Subject<AddVacancyFilterInterface>();

  private vacancyProgrammingLanguages$: BehaviorSubject<FilterRecourseProgrammingLanguages> =
    new BehaviorSubject<FilterRecourseProgrammingLanguages>({
      total: 0,
      data: [],
    });

  private vacancyProgrammingFrameworks$: BehaviorSubject<FilterRecourseProgrammingFrameworks | null> =
    new BehaviorSubject<FilterRecourseProgrammingFrameworks | null>({
      total: 0,
      data: [],
    });

  private allProgrammingLanguages$: BehaviorSubject<FilterRecourseProgrammingLanguages | null> =
    new BehaviorSubject<FilterRecourseProgrammingLanguages | null>({
      total: 0,
      data: [],
    });

  private allProgrammingFrameworks$: BehaviorSubject<FilterRecourseProgrammingFrameworks> =
    new BehaviorSubject<FilterRecourseProgrammingFrameworks>({
      total: 0,
      data: [],
    });

  private vacancyLocationCountries$: BehaviorSubject<FilterRecourseLocationCountries | null> =
    new BehaviorSubject<FilterRecourseLocationCountries | null>({
      total: 0,
      data: [],
    });

  private vacancyLocationCities$: BehaviorSubject<FilterRecourseLocationCities | null> =
    new BehaviorSubject<FilterRecourseLocationCities | null>({
      total: 0,
      data: [],
    });

  public vacancyAnalytics: Subject<VacancyInterface> =
    new Subject<VacancyInterface>();

  public vacancyCreatedEmit: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  public companyBalanceTariff: Subject<BalanceTariffInterface[]> = new Subject<
    BalanceTariffInterface[]
  >();

  public setVacancyProgrammingLanguages(
    languages: FilterRecourseProgrammingLanguages,
    reset: boolean
  ) {
    if (!!languages?.data?.length) {
      return this.vacancyProgrammingLanguages$.next({
        total: languages.total,
        data: reset
          ? languages.data
          : this.vacancyProgrammingLanguages$.value?.data?.concat(
              languages.data
            ),
      });
    }
  }

  public setAllProgrammingLanguages(
    languages: FilterRecourseProgrammingLanguages
  ) {
    if (!!languages?.data?.length) {
      this.allProgrammingLanguages$.next({
        total: languages.total,
        data: languages.data,
      });
    } else {
      this.allProgrammingLanguages$.next(null);
    }
  }

  public getVacancyProgrammingLanguages() {
    return this.vacancyProgrammingLanguages$.asObservable();
  }

  public setVacancyProgrammingFrameworks(
    frameworks: FilterRecourseProgrammingFrameworks,
    reset: boolean
  ) {
    if (!!frameworks?.data?.length) {
      return this.vacancyProgrammingFrameworks$.next({
        total: frameworks.total,
        data: reset
          ? frameworks.data
          : this.vacancyProgrammingFrameworks$.value?.data?.concat(
              frameworks.data
            ),
      });
    }
    return this.vacancyProgrammingFrameworks$.next(null);
  }

  public setAllProgrammingFrameworks(
    frameworks: FilterRecourseProgrammingFrameworks
  ) {
    return this.allProgrammingFrameworks$.next({
      total: frameworks?.total,
      data: frameworks?.data,
    });
  }

  public getVacancyProgrammingFrameworks() {
    return this.vacancyProgrammingFrameworks$.asObservable();
  }

  public getAllProgrammingFrameworks() {
    return this.allProgrammingFrameworks$.asObservable();
  }

  public getAllProgrammingLanguages() {
    return this.allProgrammingLanguages$.asObservable();
  }

  public addFilterData(filter: AddVacancyFilterInterface) {
    this.vacancyFilterSubject.next(filter);
  }

  public get vacancyProgrammingLanguagesSubject(): FilterRecourseProgrammingLanguages {
    return this.vacancyProgrammingLanguages$.value;
  }

  public get vacancyLocationCountriesSubject(): FilterRecourseLocationCountries | null {
    return this.vacancyLocationCountries$.value;
  }

  public get vacancyProgrammingFrameworksSubject(): FilterRecourseProgrammingFrameworks | null {
    return this.vacancyProgrammingFrameworks$.value;
  }

  public setVacancyLocationCountries$(
    countries: FilterRecourseLocationCountries
  ): void {
    if (!!countries?.data?.length) {
      this.vacancyLocationCountries$.next({
        total: countries.total,
        data: countries.data,
      });
    } else {
      this.vacancyLocationCountries$.next(null);
    }
  }

  public setVacancyLocationCities$(cities: FilterRecourseLocationCities) {
    if (!!cities?.data) {
      this.vacancyLocationCities$.next({
        total: cities.total,
        data: cities?.data,
      });
    } else {
      this.vacancyLocationCities$.next(null);
    }
  }

  public resetVacancyLocationCities(): void {
    this.vacancyLocationCities$.next({ total: 0, data: [] });
  }

  public resetVacancyLocationCountries(): void {
    this.vacancyLocationCities$.next({ total: 0, data: [] });
  }

  public getVacancyLocationCities$(): Observable<FilterRecourseLocationCities | null> {
    return this.vacancyLocationCities$.asObservable();
  }

  public getVacancyLocationCountries$(): Observable<FilterRecourseLocationCountries | null> {
    return this.vacancyLocationCountries$.asObservable();
  }

  public allVacancySubject: BehaviorSubject<any> = new BehaviorSubject(null);

  public setAllVacancies(vacancies: AddVacancyInterface) {
    this.allVacancySubject.next(vacancies);
  }

  public deleteVacancy(uuid: string | undefined): void {
    const vacancies: AddVacancyInterface[] =
      this.allVacancySubject.value.result;
    vacancies.forEach((item, index) => {
      if (item.uuid === uuid) {
        vacancies.splice(index, 1);
      }
    });
  }

  public getIsCompletedVacancyCreate(): Observable<boolean> {
    return this.vacancyCreatedEmit.asObservable();
  }

  public setIsCompletedVacancyCreate(value: boolean) {
    this.vacancyCreatedEmit.next(value);
  }

  public setCompanyBalance(balanceTariff: BalanceTariffInterface[]) {
    this.companyBalanceTariff.next(balanceTariff);
  }

  public getCompanyBalance(): Observable<BalanceTariffInterface[]> {
    return this.companyBalanceTariff.asObservable();
  }
}

import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import {
  IFilterRecourseLocationCities,
  IFilterRecourseLocationCountries,
  IFilterRecourseProgrammingFrameworks,
  IFilterRecourseProgrammingLanguages,
} from "../interfaces/filter-recourse.interface";
import { IAddVacancy } from "../../../shared/interfaces/add-vacancy.interface";
import { IBalanceTariff } from "src/app/shared/interfaces/balance-tariff.interface";

@Injectable({
  providedIn: "root",
})
export class VacancyState {
  private vacancyProgrammingFrameworks$: BehaviorSubject<IFilterRecourseProgrammingFrameworks | null> =
    new BehaviorSubject<IFilterRecourseProgrammingFrameworks | null>({
      total: 0,
      data: [],
    });

  private allProgrammingLanguages$: BehaviorSubject<IFilterRecourseProgrammingLanguages | null> =
    new BehaviorSubject<IFilterRecourseProgrammingLanguages | null>({
      total: 0,
      data: [],
    });

  private vacancyLocationCountries$: BehaviorSubject<IFilterRecourseLocationCountries | null> =
    new BehaviorSubject<IFilterRecourseLocationCountries | null>({
      total: 0,
      data: [],
    });

  private vacancyLocationCities$: BehaviorSubject<IFilterRecourseLocationCities | null> =
    new BehaviorSubject<IFilterRecourseLocationCities | null>({
      total: 0,
      data: [],
    });

  public vacancyCreatedEmit: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public companyBalanceTariff: BehaviorSubject<IBalanceTariff[]> = new BehaviorSubject<IBalanceTariff[]>([]);

  public setAllProgrammingLanguages(languages: IFilterRecourseProgrammingLanguages) {
    if (!!languages?.data?.length) {
      this.allProgrammingLanguages$.next({
        total: languages.total,
        data: languages.data,
      });
    } else {
      this.allProgrammingLanguages$.next(null);
    }
  }

  public setVacancyProgrammingFrameworks(frameworks: IFilterRecourseProgrammingFrameworks, reset: boolean) {
    if (!!frameworks?.data?.length) {
      return this.vacancyProgrammingFrameworks$.next({
        total: frameworks.total,
        data: reset ? frameworks.data : this.vacancyProgrammingFrameworks$.value?.data?.concat(frameworks.data),
      });
    }
    return this.vacancyProgrammingFrameworks$.next(null);
  }

  public getVacancyProgrammingFrameworks$() {
    return this.vacancyProgrammingFrameworks$.asObservable();
  }

  public getAllProgrammingLanguages$() {
    return this.allProgrammingLanguages$.asObservable();
  }

  public get vacancyLocationCountriesSubject(): IFilterRecourseLocationCountries | null {
    return this.vacancyLocationCountries$.value;
  }

  public get vacancyProgrammingFrameworksSubject(): IFilterRecourseProgrammingFrameworks | null {
    return this.vacancyProgrammingFrameworks$.value;
  }

  public setVacancyLocationCountries$(countries: IFilterRecourseLocationCountries): void {
    if (!!countries?.data?.length) {
      this.vacancyLocationCountries$.next({
        total: countries.total,
        data: countries.data,
      });
    } else {
      this.vacancyLocationCountries$.next(null);
    }
  }

  public setVacancyLocationCities$(cities: IFilterRecourseLocationCities) {
    if (!!cities?.data) {
      this.vacancyLocationCities$.next({
        total: cities.total,
        data: cities?.data,
      });
    } else {
      this.vacancyLocationCities$.next(null);
    }
  }

  public getVacancyLocationCities$(): Observable<IFilterRecourseLocationCities | null> {
    return this.vacancyLocationCities$.asObservable();
  }

  public getVacancyLocationCountries$(): Observable<IFilterRecourseLocationCountries | null> {
    return this.vacancyLocationCountries$.asObservable();
  }

  public allVacancySubject: BehaviorSubject<any> = new BehaviorSubject(null);

  public setAllVacancies(vacancies: IAddVacancy) {
    this.allVacancySubject.next(vacancies);
  }

  public deleteVacancy(uuid: string | undefined): void {
    const vacancies: IAddVacancy[] = this.allVacancySubject.value.result;
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

  public setCompanyBalance(balanceTariff: IBalanceTariff[]) {
    this.companyBalanceTariff.next(balanceTariff);
  }

  public getCompanyBalance(): Observable<IBalanceTariff[]> {
    return this.companyBalanceTariff.asObservable();
  }
}

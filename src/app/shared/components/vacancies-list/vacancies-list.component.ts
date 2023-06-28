import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";

import { BehaviorSubject, Observable, takeUntil } from "rxjs";
import { VacancyFacade } from "../../../modules/vacancy/services/vacancy.facade";
import { ISearchableSelectData } from "../../interfaces/searchable-select-data.interface";
import { Unsubscribe } from "../../unsubscriber/unsubscribe";
import {
  FilterByStatusEnum,
  PayedVacancyEnum,
  VacancyStatusEnum,
} from "../../../modules/vacancy/constants/filter-by-status.enum";
import { FilterByPayedStatus, FilterByStatus } from "../../../modules/vacancy/constants/filter-by-status";

@Component({
  selector: "hr-vacancies-list",
  templateUrl: "./vacancies-list.component.html",
  styleUrls: ["./vacancies-list.component.scss"],
})
export class VacanciesListComponent extends Unsubscribe implements OnInit, OnDestroy {
  @Input() isBorder: boolean = true;
  @Input() isAll: boolean = true;
  @Input() set update(value: boolean) {
    if (value) {
      this.updateData();
    }
  }
  @Input() status: VacancyStatusEnum = VacancyStatusEnum.All;
  @Input() payedStatus: PayedVacancyEnum = PayedVacancyEnum.All;

  @Input() vacancyType!: VacancyStatusEnum;
  @Input() defaultValue!: Observable<string>;

  @Output() selectedVacancy: EventEmitter<ISearchableSelectData> = new EventEmitter<ISearchableSelectData>();

  @Output() vacancyList: EventEmitter<ISearchableSelectData[]> = new EventEmitter<ISearchableSelectData[]>();

  private searchParams: BehaviorSubject<{ status: string; payedStatus: string }> = new BehaviorSubject<{
    status: string;
    payedStatus: string;
  }>({
    status: this.status,
    payedStatus: this.payedStatus,
  });

  public readonly VacancyStatusEnum = VacancyStatusEnum;

  private all = {
    id: 0,
    value: "Все",
    displayName: "Все",
    count: -1,
  };

  public isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public vacancySearchList$: BehaviorSubject<ISearchableSelectData[]> = new BehaviorSubject<ISearchableSelectData[]>([
    this.all,
  ]);

  constructor(public router: Router, private readonly _vacancyFacade: VacancyFacade) {
    super();
  }

  public ngOnInit(): void {
    this.updateData();
  }

  public updateData(): void {
    this.searchParams.next({
      status: this.status,
      payedStatus: this.payedStatus,
    });
    this.getAllVacancies();
  }

  public formatPayedStatusData(data: string): string {
    switch (data) {
      case FilterByPayedStatus.COMPLETED: {
        return FilterByStatusEnum.COMPLETED;
      }
      case FilterByPayedStatus.IN_PROGRESS: {
        return FilterByStatusEnum.IN_PROGRESS;
      }
      case FilterByPayedStatus.NOT_PAYED: {
        return FilterByStatusEnum.NOT_PAYED;
      }
      case FilterByPayedStatus.ALL: {
        return "";
      }
      default:
        return "";
    }
  }

  public formatStatusData(data: string): boolean | string {
    switch (data) {
      case FilterByStatus.COMPLETED: {
        return true;
      }
      case FilterByStatus.NOT_PAYED: {
        return false;
      }
      case FilterByStatus.ALL: {
        return "";
      }
      default:
        return "";
    }
  }

  public selectVacancy(selectedVacancy: ISearchableSelectData): void {
    this.selectedVacancy.next(selectedVacancy);
  }

  private getSelectedPaginationValue(): void {
    const [all] = this.vacancySearchList$.value;
    this._vacancyFacade.getVacanciesForSelection(this.searchParams.value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (vacancies) => {
          if (this.isAll) {
            this.vacancySearchList$.next(JSON.parse(JSON.stringify([all, ...vacancies])));
          } else {
            this.vacancySearchList$.next(JSON.parse(JSON.stringify([...vacancies])));
          }
          this.vacancyList.emit(this.vacancySearchList$.value);
          this.isLoading.next(false);
        },
        error: () => {
          this.isLoading.next(false);
        },
      });
  }

  private getAllVacancies() {
    this.isLoading.next(true);
    this.getSelectedPaginationValue();
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}

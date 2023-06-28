import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class BalanceState {
  private tariffCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private selectedContentReference$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private isTariffBouth: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private isTariffBoughtFromVacancy: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isChooseModalOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public setTariffCountUnChanged(packageCount: number): void {
    this.tariffCount.next(packageCount);
  }

  public setTariffCountChanged(): void {
    if (this.tariffCount.value > 0) {
      let count = this.tariffCount.value;
      count--;
      this.tariffCount.next(count);
    }
  }

  public getTariffCount(): Observable<number> {
    return this.tariffCount.asObservable();
  }

  public getTariffBouth(): Observable<boolean> {
    return this.isTariffBouth.asObservable();
  }

  public setTariffBouth(isBuy: boolean): void {
    this.isTariffBouth.next(isBuy);
  }

  public getTariffBoughtFromVacancy(): Observable<boolean> {
    return this.isTariffBoughtFromVacancy.asObservable();
  }

  public setTariffBoughtFromVacancy(isTariff: boolean): void {
    this.isTariffBoughtFromVacancy.next(isTariff);
  }

  public setSelectedContentReference(ref: string) {
    this.selectedContentReference$.next(ref);
  }

  public getSelectedContentReference(): Observable<string> {
    return this.selectedContentReference$;
  }

  public setIsChooseModalOpen(isModalOpenAction: boolean): void {
    this.isChooseModalOpen.next(isModalOpenAction);
  }

  public getIsChooseModalOpen(): Observable<boolean> {
    return this.isChooseModalOpen;
  }
}

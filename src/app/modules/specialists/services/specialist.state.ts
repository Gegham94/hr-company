import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs";
import { ISpecialist } from "../specialist-profile/interfaces/specialist.interface";
import { Specialist } from "../interfaces/specialist.interface";
import { ISpecialistLists } from "../interfaces/specialist-test.interface";

@Injectable({
  providedIn: "root",
})
export class SpecialistState {
  private readonly specialist$: BehaviorSubject<ISpecialist | null> = new BehaviorSubject<ISpecialist | null>(null);

  private readonly specialistsNotificationCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private readonly isNavigateFromNotifications$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private paymentMessage: BehaviorSubject<string> = new BehaviorSubject("");

  public getSpecialist$(): Observable<ISpecialist | null> {
    return this.specialist$.asObservable();
  }

  public deleteSelectedSpecialistByUuid(): void {
    this.specialist$.next(null);
  }

  // public setSpecialist(specialist: ISpecialist | null): void {
  //   this.specialist$.next(specialist);
  // }

  public getIsNavigateFromNotifications$(): Observable<any> {
    return this.isNavigateFromNotifications$.asObservable();
  }

  public getSpecialistsNotificationCount(): number {
    return this.specialistsNotificationCount$.value;
  }

  public getSpecialistsNotificationCount$(): Observable<number> {
    return this.specialistsNotificationCount$.asObservable();
  }

  // State setters
  public setIsNavigateFromNotifications$(state: boolean): void {
    this.isNavigateFromNotifications$.next(state);
  }

  public setSpecialist(specialist: ISpecialist | null): void {
    this.specialist$.next(specialist);
  }

  public setSpecialistsNotificationCount$(count: number): void {
    this.specialistsNotificationCount$.next(count);
  }

  public setBuyVacancyAcceptPaymentMessage(popupMessageEnum: string): void {
    this.paymentMessage.next(popupMessageEnum);
  }
}

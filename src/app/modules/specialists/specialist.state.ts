import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {Observable} from "rxjs";
import {Specialist} from "./interfaces/specialist.interface";
import {SpecialistListsInterface} from "./interface/specialist-test.interface";

@Injectable({
  providedIn: "root"
})
export class SpecialistState {
  private readonly specialist$: BehaviorSubject<Specialist | SpecialistListsInterface | null>
    = new BehaviorSubject<Specialist | SpecialistListsInterface | null>(null);

  private readonly specialistsNotificationCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private readonly isNavigateFromNotifications$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public getSpecialist$(): Observable<any> {
    return this.specialist$.asObservable();
  }

  public setSpecialist(specialist: Specialist | SpecialistListsInterface): void {
    this.specialist$.next(specialist);
  }

  public getIsNavigateFromNotifications$(): Observable<any> {
    return this.isNavigateFromNotifications$.asObservable();
  }

  public setIsNavigateFromNotifications$(state: boolean): void {
    this.isNavigateFromNotifications$.next(state);
  }

  public getSpecialistsNotificationCount(): number {
    return this.specialistsNotificationCount$.value;
  }

  public getSpecialistsNotificationCount$(): Observable<number> {
    return this.specialistsNotificationCount$.asObservable();
  }

  public setSpecialistsNotificationCount$(count: number): void {
    this.specialistsNotificationCount$.next(count);
  }

}

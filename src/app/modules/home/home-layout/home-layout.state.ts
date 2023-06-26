import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { NavigateButton } from "./home-layout.interface";

@Injectable({
  providedIn: "root"
})
export class HomeLayoutState {
  private isRobotMap$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private isRobotHelper$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private helperInfo$: BehaviorSubject<string> = new BehaviorSubject<string>("");

  public buttonsStatuses: BehaviorSubject<NavigateButton[]> = new BehaviorSubject<NavigateButton[]>([
    {
      link: "/vacancy/create-filter/isActive",
      status: false
    },
    {
      link: "/vacancies/isActive",
      status: false
    },
    {
      link: "/specialists/isActive",
      status: false
    },
    {
      link: "/analytic/isActive",
      status: false
    },
    {
      link: "/balance/isActive",
      status: false
    }]);

  public updateNavigationButtons: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public get isRobotMap(): boolean {
    return this.isRobotMap$.value;
  }

  public set isRobotMap(value: boolean) {
    this.isRobotMap$.next(value);
  }

  public get isRobotHelper(): boolean {
    return this.isRobotHelper$.value;
  }

  public getIsRobotHelper$(): Observable<boolean> {
    return this.isRobotHelper$.asObservable();
  }

  public set isRobotHelper(value: boolean) {
    this.isRobotHelper$.next(value);
  }

  public get helperInfo(): string {
    return this.helperInfo$.value;
  }

  public set helperInfo(value: string) {
    this.helperInfo$.next(value);
  }

  public getIsRobotMap(): Observable<boolean> {
    return this.isRobotMap$ as Observable<boolean>;
  }

  public isNavigationButtonsUpdate(): Observable<boolean>{
    return this.updateNavigationButtons.asObservable();
  }

  public getButtonsStatuses(): NavigateButton[] {
    return this.buttonsStatuses.value;
  }
}

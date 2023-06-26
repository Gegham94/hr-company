import {Injectable} from "@angular/core";
import {BehaviorSubject, delay, Observable} from "rxjs";
import {RobotHelper, RobotHelperInterface} from "../interfaces/robot-helper.interface";

@Injectable({
  providedIn: "root"
})
export class RobotHelperService {


  public robot$: BehaviorSubject<RobotHelper> = new BehaviorSubject<RobotHelper>(null);

  public isRobotOpen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
  }

  public setRobotSettings(settings: RobotHelperInterface): void {
    this.robot$.next(settings);
  }

  public getRobotSettings(): Observable<RobotHelper> {
    return this.robot$;
  }

  public setIsRobotOpen(value: boolean): void {
    this.isRobotOpen$.next(value);
  }

  public getIsRobotOpen(): Observable<boolean> {
    return this.isRobotOpen$.pipe(delay(0));
  }


}

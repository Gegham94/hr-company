import {Injectable} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {IAnalytics} from "../interfaces/vacancy-analytics.interface";

@Injectable({
  providedIn: "root"
})
export class AnalyticsState {
  private analytics: Subject<IAnalytics> = new Subject<IAnalytics>();

  public getAnalytics(): Observable<IAnalytics> {
    return this.analytics.asObservable();
  }

  public setAnalytics(value: IAnalytics): void {
    this.analytics.next(value);
  }
}

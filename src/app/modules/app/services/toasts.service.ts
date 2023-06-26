import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {ToastInterface} from "../interfaces/toast.interface";
import {StatusTypeEnum} from "../constants/status-type.enum";
import Timeout = NodeJS.Timeout;

@Injectable({
  providedIn: "root"
})

export class ToastsService {

  // @ts-ignore
  private toasts: BehaviorSubject<ToastInterface[]> = new BehaviorSubject([]);
  private timeout!: Timeout;
  private status$: BehaviorSubject<StatusTypeEnum> = new BehaviorSubject<StatusTypeEnum>(StatusTypeEnum.success);

  public addToast(message: ToastInterface, duration: number = 3000): void {
    this.toasts.next([message]);
    this.timeout = setTimeout(() => {
      this.removeToast();
    }, duration);
  }

  public getToast(): Observable<ToastInterface[]> {
    return this.toasts.asObservable();
  }

  public removeToast() {
    this.toasts.next([]);
    clearTimeout(this.timeout);
  }

  public setStatus$(value: StatusTypeEnum) {
    this.status$.next(value);
  }

  public getStatus$(): Observable<StatusTypeEnum> {
    return this.status$.asObservable();
  }
}

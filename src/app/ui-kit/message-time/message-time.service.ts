import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable()
export class MessageTimeService {
  public sendCodeAgain$ = new BehaviorSubject<boolean>(false);

  public getNewCode(): Observable<boolean> {
    return this.sendCodeAgain$.asObservable();
  }

  public setNewCode(): void {
    this.sendCodeAgain$.next(true);
  }


}

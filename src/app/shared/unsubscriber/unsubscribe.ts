import { Subject } from "rxjs";

export class Unsubscribe {
  public ngUnsubscribe: Subject<void> = new Subject();

  protected unsubscribe(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

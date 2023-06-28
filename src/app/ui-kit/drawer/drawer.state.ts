import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DrawerState {
  private drawerState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public getDrawerState$(): Observable<boolean> {
    return this.drawerState;
  }

  public getDrawerState(): boolean {
    return this.drawerState.value;
  }

  public setDrawerState(value: boolean): void {
    this.drawerState.next(value);
  }
}

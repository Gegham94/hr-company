import { Injectable } from "@angular/core";
import { BreakpointObserver } from "@angular/cdk/layout";
import { fromEvent, map, Observable } from "rxjs";
import { ScreenSizeType } from "../interfaces/screen-size.type";

@Injectable({
  providedIn: "root",
})
export class ScreenSizeService {
  constructor(private readonly breakpointObserver: BreakpointObserver) {}

  public readonly screenSize$: Observable<ScreenSizeType> = fromEvent(
    window,
    "resize"
  ).pipe(map(() => this.calcScreenSize));

  public get calcScreenSize(): ScreenSizeType {
    if (this.breakpointObserver.isMatched("(max-width: 500px)")) {
      return "EXTRA_SMALL";
    } else if (this.breakpointObserver.isMatched("(max-width: 750px)")) {
      return "MOBILE";
    } else {
      return "DESKTOP";
    }
  }
}

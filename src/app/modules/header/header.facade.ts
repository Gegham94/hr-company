import { Injectable } from "@angular/core";
import { HeaderState } from "./header.state";
import { Observable } from "rxjs";
import { HeaderDropdownsEnum } from "./constants/header-dropdowns.enum";

@Injectable({
  providedIn: "root"
})
export class HeaderFacade {
  constructor(
    private readonly _headerState: HeaderState,
  ) {}

  public setStateDropdown$(data: HeaderDropdownsEnum, state: boolean): void {
    return this._headerState.setStateDropdown$(data, state);
  }

  public getStateDropdown$(data: HeaderDropdownsEnum): Observable<boolean> {
    return this._headerState.getStateDropdown$(data);
  }

  public getStateDropdown(data: HeaderDropdownsEnum): boolean {
    return this._headerState.getStateDropdown(data);
  }

  public resetDropdownsState(type: HeaderDropdownsEnum, newState?: boolean) {
    if (!!newState) {
      this.setStateDropdown$(type,newState);
    }
    this.setStateDropdown$(type, !this.getStateDropdown(type)
    );
  }

}

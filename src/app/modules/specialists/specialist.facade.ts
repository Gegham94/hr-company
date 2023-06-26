import {Injectable} from "@angular/core";

import {CompanyState} from "../company/company.state";
import {Observable} from "rxjs";
import {SpecialistState} from "./specialist.state";
import {FilteredSpecialistsListRequest, Specialist} from "./interfaces/specialist.interface";
import {SpecialistFilterInterface} from "./interfaces/specialist-filter-interface";
import {SpecialistService} from "./specialist.service";
import {SpecialistListsInterface} from "./interface/specialist-test.interface";
import {LocalStorageService} from "../app/services/local-storage.service";
import {ChatFacade} from "../chat/chat.facade";

@Injectable({
  providedIn: "root",
})
export class SpecialistFacade {
  constructor(
    private readonly _companyState: CompanyState,
    private readonly _specialistService: SpecialistService,
    private readonly _localStorage: LocalStorageService,
    private readonly _specialistFacade: SpecialistFacade,
    private readonly _chatFacade: ChatFacade,
    private readonly _specialistState: SpecialistState
  ) {
  }

  public updateFavorites(uuid: string, isFavorite: boolean): Observable<{ data: string }> {
    return this._specialistService.updateFavorites(uuid, isFavorite);
  }

  public hideOtherSpecialist(specialistUuid: string) {
    return this._specialistService.hideOtherSpecialist(specialistUuid);
  }

  public getSpecialistData(uuid: string): Specialist {
    return this._companyState.specialistData(uuid);
  }

  public getSpecialist$(): Observable<Specialist> {
    return this._specialistState.getSpecialist$();
  }

  public setIsNavigateFromNotifications$(state: boolean): void {
    this._specialistState.setIsNavigateFromNotifications$(state);
  }

  public getIsNavigateFromNotifications$(): Observable<Specialist> {
    return this._specialistState.getIsNavigateFromNotifications$();
  }

  public setSpecialist(specialist: Specialist | SpecialistListsInterface): void {
    this._specialistState.setSpecialist(specialist);
  }

  public getFilteredSpecialistList(
    skip: number,
    params: SpecialistFilterInterface
  ): Observable<FilteredSpecialistsListRequest> {
    return this._specialistService.getFilteredSpecialistList(skip, params);
  }

  public updateSpecialistsNotificationCount(): void {
    this._specialistService.getSpecialistsNotificationCount().subscribe((data) => {
      this._specialistState.setSpecialistsNotificationCount$(data.count);
    });
  }

  public getSpecialistsNotificationCount$(): Observable<number> {
    return this._specialistState.getSpecialistsNotificationCount$();
  }

  public getSpecialistsNotificationCount(): number {
    return this._specialistState.getSpecialistsNotificationCount();
  }

  public setSpecialistsNotificationCount(uuid: string): void {
    this._specialistService.setSpecialistsNotificationCount(uuid).subscribe(() => {
      this.updateSpecialistsNotificationCount();
    });
  }

}

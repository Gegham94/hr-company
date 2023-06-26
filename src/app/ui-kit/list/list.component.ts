import {Component, Input} from "@angular/core";
import {ButtonTypeEnum} from "../../modules/app/constants/button-type.enum";
import {ListTypesEnum} from "../../modules/app/constants/list-types.enum";
import {Router} from "@angular/router";
import {searchFormatDate} from "../../helpers/search-format-date";
import {SpecialistFacade} from "../../modules/specialists/specialist.facade";

@Component({
  selector: "hr-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"]
})
export class ListComponent {
  public buttonTypesList = ButtonTypeEnum;
  @Input("type") typeProps?: ListTypesEnum = ListTypesEnum.default;
  @Input("person-name") personName?: string = "";
  @Input("person-surname") personSurname?: string = "";
  @Input("person-email") personEmail?: string = "";
  @Input("person-position") personPosition: string = "";
  @Input("person-work-date") personWorkDate: string = "";
  @Input("user-uuid") userUuid: string = "";
  @Input("disabled") disabled?: boolean;
  @Input("isNew") isNew?: boolean;
  @Input("found-specialist-uuid") foundSpecialistUuid!: string;

  constructor(
    private readonly router: Router,
    private readonly _specialistsFacade: SpecialistFacade) {
  }

  public specProfile() {
    this.decrementNotifications();
    this.router.navigate([`specialists/profile/`], {
      queryParams: {uuid: this.userUuid, foundSpecialistUuid: this.foundSpecialistUuid}
    });
  }

  public get workDate(): string {
    return searchFormatDate(new Date(this.personWorkDate));
  }

  public decrementNotifications(): void {
    this._specialistsFacade.setSpecialistsNotificationCount(this.foundSpecialistUuid);
  }
}

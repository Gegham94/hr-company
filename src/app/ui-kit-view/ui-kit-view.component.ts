import { Component } from "@angular/core";
import { ButtonTypeEnum } from "../modules/app/constants/button-type.enum";
import { NavigateButtonTypesEnum } from "../modules/app/constants/navigate-button-types.enum";
import { TagTypesEnum } from "../modules/app/constants/tag-types.enum";
import { InputStatusEnum } from "../modules/app/constants/input-status.enum";
import { ListTypesEnum } from "../modules/app/constants/list-types.enum";
import { SearchableSelectDataInterface } from "../modules/app/interfaces/searchable-select-data.interface";
import { VacancyInterface } from "../modules/app/interfaces/vacancy.interface";

@Component({
  selector: "hr-ui-kit-view",
  templateUrl: "./ui-kit-view.component.html",
  styleUrls: ["./ui-kit-view.component.scss"]
})
export class UiKitViewComponent {
  public buttonTypesList = ButtonTypeEnum;
  public navigateButtonTypesList = NavigateButtonTypesEnum;
  public tagTypesList = TagTypesEnum;
  public inputStatusList = InputStatusEnum;
  public listTypesList = ListTypesEnum;

  constructor() {
  }

  public isModalOpen: boolean = false;
  title = "hr-bot";

  public searchList: SearchableSelectDataInterface[] = [
    { id: 0, value: "armenia", displayName: "Armenia" },
    { id: 1, value: "russia", displayName: "Russia" },
    { id: 2, value: "angola", displayName: "Angola" },
    { id: 3, value: "portugal", displayName: "Portugal" },
    { id: 4, value: "germany", displayName: "Germany" },
    { id: 5, value: "canada", displayName: "Canada" }
  ];

  modalToggle(val?: boolean) {
    this.isModalOpen = (val !== undefined) ? val : !this.isModalOpen;
  }

  public vacancyAnalyticList: VacancyInterface = {
    uuid: "",
    name: "Angular  Developer   dev",
    deadlineDate: "22/07/2021",
    payedStatus: "Завершен",
    status: true,
    vacancyProgress: 100
  };
}

import {IHelper} from "./company.interface";

export interface NavigateButtonInterface {
  id: number;
  text: string;
  statusType: "default" | "disabled";
  icon: string;
  link: string;
}

export class NavigationButton implements NavigateButtonInterface {
  id!: number;
  text!: string;
  statusType!: "default" | "disabled";
  icon!: string;
  link!: string;

  constructor(navButton: NavigateButtonInterface, helper: IHelper) {
    Object.assign(this, navButton);
    helper.hidden ? this.statusType = "default" : "disabled";
  }
}

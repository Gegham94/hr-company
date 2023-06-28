import {Component, Input} from "@angular/core";
import {ISearchedSettings} from "../../shared/interfaces/add-vacancy.interface";

@Component({
  selector: "hr-job-skills",
  templateUrl: "./job-skills.component.html",
  styleUrls: ["./job-skills.component.scss"]
})
export class JobSkillsComponent {

 @Input() jobSkills!: ISearchedSettings;

  constructor() { }

  public isArray(vacancy: unknown): boolean {
    return typeof vacancy === "object";
  }

}

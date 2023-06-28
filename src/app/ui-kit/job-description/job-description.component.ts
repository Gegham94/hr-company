import {Component, Input} from "@angular/core";
import {IAddVacancy, ISearchedSettings} from "../../shared/interfaces/add-vacancy.interface";

@Component({
  selector: "hr-job-description",
  templateUrl: "./job-description.component.html",
  styleUrls: ["./job-description.component.scss"]
})
export class JobDescriptionComponent {

  @Input() jobInfo!: IAddVacancy;
  @Input() jobSkills!: ISearchedSettings;
}

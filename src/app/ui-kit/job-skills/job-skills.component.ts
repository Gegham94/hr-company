import {Component, Input, OnInit} from "@angular/core";

@Component({
  selector: "hr-job-skills",
  templateUrl: "./job-skills.component.html",
  styleUrls: ["./job-skills.component.scss"]
})
export class JobSkillsComponent implements OnInit {

 @Input() jobSkills :any;

  constructor() { }

  public isArray(vacancy: unknown): boolean {
    return typeof vacancy === "object";
  }

  ngOnInit(): void {
  }

}

import {Component, Input, OnInit} from "@angular/core";

@Component({
  selector: "hr-job-description",
  templateUrl: "./job-description.component.html",
  styleUrls: ["./job-description.component.scss"]
})
export class JobDescriptionComponent implements OnInit {

  @Input() jobInfo:any;

  constructor() { }

  ngOnInit(): void {
  }

}

import {Component, Input} from "@angular/core";

@Component({
  selector: "hr-specialists-progress-bar",
  templateUrl: "./specialists-progress-bar.component.html",
  styleUrls: ["./specialists-progress-bar.component.scss"],
})
export class SpecialistsProgressBarComponent {
  @Input() percentage: number | null = 0;

  getProgressBarColor() {
    if(this.percentage){
      if (this.percentage >= 0 && this.percentage <= 50) {
        return "green";
      } else if (this.percentage > 50 && this.percentage <= 80) {
        return "orange";
      } else if (this.percentage > 80 && this.percentage <= 100) {
        return "red";
      }
    }
    return "green";
  }

}

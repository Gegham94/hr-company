import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { debounceTime } from "rxjs";
import { ProgressBarHelper } from "../../../../shared-modules/helpers/progress-bar.helper";
import { AddVacancyInterfaceOrNull } from "../../interfaces/add-vacancy-filter.interface";

@Component({
  selector: "hr-progress-bar-for-steps",
  templateUrl: "./progress-bar-for-steps.component.html",
  styleUrls: ["./progress-bar-for-steps.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBarForStepsComponent implements OnChanges{
   public progressStep1:number = 0;
   public progressStep2:number = 0;
  @Input("form-group") formGroup!: FormGroup;
  @Input("updateProgressBar") updateProgressBar!: AddVacancyInterfaceOrNull;
  @Input("edit") edit!: boolean;

  ngOnChanges() {
    this.progressStep1 = ProgressBarHelper.calcPercent(this.formGroup.controls["searchedSettings"] as FormGroup);
    this.progressStep2 = ProgressBarHelper.calcPercent(this.formGroup);
  }

  ngOnInit() {
    this.formGroup.controls["searchedSettings"].valueChanges.pipe(debounceTime(300)).subscribe(m => {
      this.progressStep1 = ProgressBarHelper.calcPercent(this.formGroup.controls["searchedSettings"] as FormGroup);
    });

    this.formGroup.valueChanges.pipe(debounceTime(300)).subscribe(m => {
      this.progressStep2 = ProgressBarHelper.calcPercent(this.formGroup);
    });
  }
}

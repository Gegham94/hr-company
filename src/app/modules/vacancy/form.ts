import {Injectable} from "@angular/core";
import {
  FormBuilder, FormControl, FormGroup,
  Validators
} from "@angular/forms";

@Injectable({providedIn: "root"})
export class CreateVacancyForm {

  public readonly formGroup: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder) {

    this.formGroup = formBuilder.group({
      name: ["", [Validators.required]],
      description: ["", [Validators.required]],
      responsibility: ["", [Validators.required]],
      conditions: ["", [Validators.required]],
      deadlineDate: [null, [Validators.required, Validators.min(7), Validators.max(70)]],
      salary: [0, [Validators.required]],
      valute: ["", [Validators.required]],
      searchedSettings: formBuilder.group(
        {
          country: ["", [Validators.required]],
          city: ["", [Validators.required]],
          programmingLanguages: [[], [Validators.required]],
          vacancyLevel: ["", [Validators.required]],
          workplace: ["", [Validators.required]],
          programmingFrameworks: [[], [Validators.required]],
          nativeLanguages: [[], [Validators.required]],
          wayOfWorking: ["", [Validators.required]],
        }
      )
    });

  }

  public getFormControl(controlName: string, groupName: string = ""): FormControl {
    if (groupName) {
      return this.formGroup.controls[groupName].get(controlName) as FormControl;
    } else {
      return this.formGroup.get(controlName) as FormControl;
    }
  }


}

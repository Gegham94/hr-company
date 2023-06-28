import { FormGroup } from "@angular/forms";

export class ProgressBarHelper {

  static calcPercent(form: FormGroup): number {
    let value = 0;
    let count = Object.values(form.value).length;
    Object.keys(form.controls).forEach(key => {

      if(key !== "searchedSettings" && key !== "minIncome" && form.controls[key].valid && form.controls[key].value) {
        value++;
      } else if(key == "searchedSettings" || key === "sumMin"){
        count -= 1;
      }
    });
    return (value / count) * 100;
  }
}

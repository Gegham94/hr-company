import {Injectable} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Injectable({providedIn: "root"})
export class OfferForm {

  public readonly formGroup: FormGroup;

  constructor(private readonly formBuilder: FormBuilder) {

    this.formGroup = this.formBuilder.group({
      field_1: ["", [Validators.required]],
      field_2: ["", [Validators.required]],
      field_3: ["", [Validators.required]],
      field_4: ["", [Validators.required]],
      field_5: ["", [Validators.required]],
      field_6: ["", [Validators.required]],
      field_7: ["", [Validators.required]],
      field_8: ["", [Validators.required]],
      field_9: ["", [Validators.required]],
      field_10: ["", [Validators.required]],
      field_11: ["", [Validators.required]],
      field_12: ["", [Validators.required]],
      field_13: ["", [Validators.required]],
    });
  }
}

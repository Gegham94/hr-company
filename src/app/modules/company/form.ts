import {Injectable} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ValidationError} from "../app/services/validation-error.service";
import {TranslateService} from "@ngx-translate/core";

@Injectable({providedIn: "root"})
export class CompanyForm extends ValidationError {

  public readonly formGroup: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    protected override readonly _translateService: TranslateService) {
    super(_translateService);
    this.formGroup = this.formBuilder.group({
      uuid: [""],
      name: ["", [Validators.required, Validators.minLength(2)]],
      email: ["", [Validators.required,
        Validators.pattern("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")]],
      country: [[], [Validators.required, Validators.minLength(1)]],
      city: [[], [Validators.required, Validators.minLength(1)]],
      logo: ["", Validators.required],
      webSiteLink: ["", [Validators.required,
        Validators.pattern("\\b(?:https?://)[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)$")]],
      address: ["", [Validators.required, Validators.minLength(2)]],
      phone: ["", [Validators.required]],
      description: ["", [Validators.required, Validators.minLength(10)]],
      inn: ["", [Validators.required]],
      ogrn: [""]
    });

  }

  public getFormControl(controlName: string, groupName: string = ""): FormControl {
    if (groupName) {
      return this.formGroup.controls[groupName].get(controlName) as FormControl;
    } else {
      return this.formGroup.get(controlName) as FormControl;
    }
  }

  public getErrorMessages(fieldName: string): string {
    if (this.validator()(this.getFormControl(fieldName))) {
      const error = this.validator()(this.getFormControl(fieldName));
      return error?.required ?? error?.pattern ?? "";
    }
    return "";
  }

}

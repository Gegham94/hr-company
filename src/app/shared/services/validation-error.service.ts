import { Injectable } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ValidationErrorType, ValidationErrorTypesEnum } from "../enum/validation-error-types.enum";
import { TranslateService } from "@ngx-translate/core";
import { PatternModel } from "../enum/pattern-model.enum";

export interface ValidateText {
  str?: string;
  length?: number | null;
  maxLength?: number;
  fieldName?: string;
}

@Injectable({
  providedIn: "root",
})
export class ValidationError {
  public patternModel = PatternModel;

  constructor(protected readonly _translateService: TranslateService) {}

  /** Validate the text passed */
  validateText(validate: ValidateText): boolean {
    validate.str = validate.str?.toString() || "";
    if (validate.str) {
      return !(
        !validate.str.trim() ||
        validate.str.trim() === "" ||
        (length && validate.str.length < length) ||
        (validate.maxLength && validate.str.length > validate.maxLength)
      );
    }
    return false;
  }

  // Required validator function
  public validator() {
    return (control: FormControl): ValidationErrorType => {
      const name = control.value;
      for (const type in control?.errors) {
        if (control?.errors?.hasOwnProperty(type)) {
          switch (type) {
            case ValidationErrorTypesEnum.required: {
              if (!name) {
                return {
                  required: this._translateService.instant("VALIDATION_ERROR.REQUIRED"),
                };
              }
              return null;
            }
            case ValidationErrorTypesEnum.pattern: {
              const formPattern = control?.getError("pattern")?.requiredPattern;
              const regExp = new RegExp(formPattern);
              if (formPattern === this.patternModel.pattern) {
                return { pattern: this._translateService.instant("VALIDATION_ERROR.PATTERN_FOR_PASSWORD") };
              }
              if (name && !regExp.test(name)) {
                return {
                  pattern: this._translateService.instant("VALIDATION_ERROR.PATTERN"),
                };
              }
              return null;
            }
            default:
              return null;
          }
        }
      }
      return null;
    };
  }
}

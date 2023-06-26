import {FormGroup, ValidationErrors} from "@angular/forms";

export function CustomValidatorForPassword(form: FormGroup): ValidationErrors | null {
  if (form.value.password !== form?.value?.re_password){
    return { passwordsMustBeEqual: "пароли не совпадают" };
  }
  return null;
}

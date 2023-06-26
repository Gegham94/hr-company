import {Directive, HostListener} from "@angular/core";

@Directive({
  selector: "[fieldDir]"
})

export class FieldDirective {

  @HostListener("input", ["$event"])

  fieldValueMustBeNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    const strNumber = input.value.split("");
    if (strNumber.length == 1 && (Number([strNumber]) || Number([strNumber])===0 )) {
      input.value = strNumber[0];
    } else {
      input.value = "";
    }
  }

}

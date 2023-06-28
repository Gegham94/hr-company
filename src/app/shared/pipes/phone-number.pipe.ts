import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "phone"
})
export class PhonePipe implements PipeTransform {
  transform(number:string) {
    return `(${number?.slice(0,3)}) ${number?.slice(3,6)}-${number?.slice(6,8)}-${number?.slice(8,10)}`;
  }
}

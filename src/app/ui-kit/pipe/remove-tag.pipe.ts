import {Pipe} from "@angular/core";

@Pipe({
  name:"removeTag"
})

export class RemoveTagPipe {
  transform(strInputCode:string) {
    return strInputCode.replace(/<\/?[^>]+(>|$)/g, "");
  }
}

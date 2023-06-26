import {Pipe} from "@angular/core";

@Pipe({
  name:"parse"
})

export class ParsePipe {
  transform(jsonValue:string){
    return JSON.parse(jsonValue);
  }
}

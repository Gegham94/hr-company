import {Pipe} from "@angular/core";

@Pipe({
  name: "objectValue"
})

export class ObjectValuePipe {
  transform(value: object) {
    const keys = [];
    for (const key in value) {
      if (key!="employment"){
        // @ts-ignore
        keys.push({key: key, value: value[key]});
      }
    }
    return keys;
  }
}

import { ObjectType } from "../shared-modules/types/object.type";

export class FilterObjectListHelper {
  static filter<ListElementType, FilterOptionsType>(list: ListElementType[], filterOptions: FilterOptionsType)
    : Array<ListElementType> {return list.filter((element: ListElementType) => {
      let isElementMatch: boolean = true;
      Object.keys(filterOptions).forEach((option: string) => {
        if (
          (
            typeof (element as ObjectType)[option] === "string"
            && !(element as ObjectType)[option]
              .toLowerCase()
              .includes((filterOptions as ObjectType)[option].toLowerCase())
          )
          ||
          (
            typeof (element as ObjectType)[option] !== "string"
            && (element as ObjectType)[option] !== (filterOptions as ObjectType)[option]
          )
        ) {
          isElementMatch = false;
        }
      });
      return isElementMatch;
    });
  }
}

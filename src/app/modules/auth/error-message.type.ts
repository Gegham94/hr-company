import {ObjectType} from "../../shared-modules/types/object.type";

export type ErrorMsg = ErrorMsgInterface | null;

export interface ErrorMsgInterface {
  status: number;
  message: string;
  error?: ObjectType;
}

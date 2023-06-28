import {ObjectType} from "../../../shared/types/object.type";

export type ErrorMsgType = IErrorMsg | null;

export interface IErrorMsg {
  status: number;
  message: string;
  error?: ObjectType;
}

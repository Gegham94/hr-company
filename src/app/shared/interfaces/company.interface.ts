import {ObjectType} from "../types/object.type";

export type CompanyOrNullType = ICompany | null | undefined;

export interface ICompany {
  activeTariffUuid?: string;
  phone?: string;
  password?: string;
  privacy_policy?: boolean;
  access_token?: string;
  city?: string;
  country?: string;
  description?: string;
  email?: string;
  address?: string;
  name?: string;
  webSiteLink?: string;
  uuid?: string;
  logo?: File | string | null;
  inn?: string;
  ogrn?: string;
  foundSpecialists?: ObjectType;
  packageCount?: number;
  helper?: IHelper[];
}


export interface IHelper {
  createdAt: string;
  deletedAt: string;
  hidden: boolean;
  link: string;
  toType: string;
  toUuid: string;
  updatedAt: string;
  uuid: string;
}

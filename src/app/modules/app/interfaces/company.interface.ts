import {ObjectType} from "../../../shared-modules/types/object.type";

export type CompanyOrNull = CompanyInterface | null | undefined;

export interface CompanyInterface {
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
  helper?: Helper[];
}


export interface Helper {
  createdAt: string;
  deletedAt: string;
  hidden: boolean;
  link: string;
  toType: string;
  toUuid: string;
  updatedAt: string;
  uuid: string;
}

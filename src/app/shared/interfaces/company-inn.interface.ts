export interface ICompanyInn {
  result: ICompanyInnItem[];
}

export interface ICompanyInnItem {
  address: string;
  city: string;
  city_district: string;
  country: string;
  country_iso_code: string;
  email: string;
  inn: string;
  ogrn: string;
  street: string;
  value: string;
}

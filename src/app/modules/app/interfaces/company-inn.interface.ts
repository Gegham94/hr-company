export interface CompanyInnInterface {
  result: CompanyInnItemInterface[];
}

export interface CompanyInnItemInterface {
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

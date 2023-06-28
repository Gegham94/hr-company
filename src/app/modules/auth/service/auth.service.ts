import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

import jwt_decode from "jwt-decode";
import { Observable } from "rxjs";

import { IResetPassword } from "../../../shared/interfaces/reset-password.interface";
import { ISendPhone } from "../../../shared/interfaces/send-phone.interface";
import { environment } from "../../../../environments/environment";
import { ICompany } from "../../../shared/interfaces/company.interface";
import { CompanyFacade } from "../../company/services/company.facade";

type JWTDeCode = {
  exp: number;
  iat: number;
  sub: string;
  user: ICompany;
};

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly companySignIn = "company/signIn";
  private readonly companySignUp = "company/signUp";
  private readonly companyPhoneSend = "company/sms/sendCode";
  private readonly companyResetPassword = "company/sms/resetPassword";
  private readonly company = "company";
  private readonly broadcastChannel!: BroadcastChannel;

  constructor(
    private readonly _http: HttpClient,
    private readonly _router: Router,
    private readonly _companyFacade: CompanyFacade
  ) {
    this.broadcastChannel = new BroadcastChannel("auth_channel");
    this.broadcastChannel.onmessage = (event) => {
      if (event.data === "logout") {
        localStorage.clear();
        location.replace('signIn')
      }
      if (event.data === "login") {
        this._router.navigateByUrl("/company");
      }
    };
  }

  public logInEvent(): void {
    this.broadcastChannel.postMessage("login");
  }

  public logOut(): void {
    localStorage.clear();
    location.replace('signIn');
    this.broadcastChannel.postMessage("logout");
  }

  public get getToken() {
    return localStorage.getItem("access_token");
  }

  public get isTokenExpired(): boolean {
    const token = localStorage.getItem("access_token");
    if (!!token) {
      const decoded = jwt_decode<JWTDeCode>(token);
      const expiryTime = decoded.exp;
      if (expiryTime && 1000 * expiryTime - new Date().getTime() < 0) {
        this._companyFacade.removeCompanyData();
        this.logOut();
        this._router.navigateByUrl("/signIn");
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  public setToken(access_token: string | undefined): void {
    if (access_token != null) {
      localStorage.removeItem("access_token");
      localStorage.setItem("access_token", access_token);
    }
  }

  public signIn(companyRaw: ICompany, rememberUser: boolean): Observable<ICompany> {
    const fullUrl = `${environment.url}/${this.companySignIn}/dev`;
    return this._http.post<ICompany>(fullUrl, { ...companyRaw, remember: String(rememberUser) });
  }

  public singUp(signUp: ICompany): Observable<ICompany> {
    const fullUrl = `${environment.url}/${this.companySignUp}`;
    return this._http.post<ICompany>(fullUrl, { ...signUp });
  }

  public getCompany(): Observable<ICompany> {
    return this._http.get<ICompany>(`${environment.url}/${this.company}`);
  }

  public sendPhoneNumber(phoneNumber: ISendPhone): Observable<ISendPhone> {
    const fullUrl = `${environment.url}/${this.companyPhoneSend}`;
    return this._http.post<ISendPhone>(fullUrl, { ...phoneNumber });
  }

  public sendResetPassword(resetPassword: IResetPassword): Observable<IResetPassword> {
    const fullUrl = `${environment.url}/${this.companyResetPassword}`;
    return this._http.post<IResetPassword>(fullUrl, { ...resetPassword });
  }
}

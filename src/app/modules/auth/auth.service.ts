import {Injectable} from "@angular/core";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {CompanyInterface} from "../app/interfaces/company.interface";
import {Observable} from "rxjs";
import jwt_decode from "jwt-decode";
import {Router} from "@angular/router";
import {CompanyFacade} from "../company/company.facade";
import {SendPhoneInterface} from "../app/interfaces/send-phone.interface";
import {ResetPasswordInterface} from "../app/interfaces/reset-password.interface";

type JWTDeCode = {
  exp: number
  iat: number
  sub: string
  user: CompanyInterface
};

@Injectable({
  providedIn: "root"
})

export class AuthService {
  private readonly companySignIn = "company/signIn";
  private readonly companySignUp = "company/signUp";
  private readonly companyPhoneSend = "company/sms/sendCode";
  private readonly companyResetPassword = "company/sms/resetPassword";
  private readonly broadcastChannel!: BroadcastChannel;

  constructor(
    private readonly _http: HttpClient,
    private readonly _router: Router,
    private readonly _companyFacade: CompanyFacade,
    ) {
    this.broadcastChannel = new BroadcastChannel("auth_channel");
    this.broadcastChannel.onmessage = (event) => {
      if (event.data === "logout") {
        location.replace("/");
        localStorage.clear();
        this._router.navigateByUrl("/signIn");
      }
      if (event.data === "login") {
        this._router.navigateByUrl("/company");
      }
    };
  }


  public signIn(companyRaw: CompanyInterface, rememberUser: boolean): Observable<CompanyInterface> {
    const fullUrl = `${environment.url}/${this.companySignIn}/dev`;
    return this._http.post<CompanyInterface>(fullUrl,
      {...companyRaw, remember: String(rememberUser)});
  }


  public logInEvent(): void {
    this.broadcastChannel.postMessage("login");
  }

  public logOutEvent(): void {
    this.broadcastChannel.postMessage("logout");
  }

  public logOut(): void {
    location.replace("/");
    localStorage.clear();
    this.logOutEvent();
  }

  public get getToken() {
    return localStorage.getItem("access_token");
  }

  public get isTokenExpired(): boolean {
    const token = localStorage.getItem("access_token");
    if (!!token) {
      const decoded = jwt_decode<JWTDeCode>(token);
      const expiryTime = decoded.exp;
      if (expiryTime && ((1000 * expiryTime) - (new Date()).getTime()) < 0) {
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

  public singUp(signUp: CompanyInterface): Observable<CompanyInterface> {
    const fullUrl = `${environment.url}/${this.companySignUp}`;

    return this._http.post<CompanyInterface>(fullUrl, {...signUp});
  }

  public getCompany(): Observable<CompanyInterface> {
    return this._http.get<CompanyInterface>(`${environment.url}/company`);
  }

  public sendPhoneNumber(phoneNumber: SendPhoneInterface): Observable<SendPhoneInterface> {
    const fullUrl = `${environment.url}/${this.companyPhoneSend}`;
    return this._http.post<SendPhoneInterface>(fullUrl, {...phoneNumber});
  }

  public sendResetPassword(resetPassword: ResetPasswordInterface): Observable<ResetPasswordInterface> {
    const fullUrl = `${environment.url}/${this.companyResetPassword}`;
    return this._http.post<ResetPasswordInterface>(fullUrl, {...resetPassword});
  }
}

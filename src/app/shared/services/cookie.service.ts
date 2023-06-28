import {Injectable} from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class CookieService {

  public getCookie(name: string): string | null {
    const value = `${document.cookie}`;
    const parts = value.split(`${name}=`);
    if (parts[0].split("=")[1]) {
      return parts[0].split("=")[1];
    }
    return null;
  }

  public deleteCookie(name: string): void {
    document.cookie = name + "=; Max-Age=0";
  }
}

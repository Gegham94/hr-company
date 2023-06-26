import {Injectable} from "@angular/core";
import {NavigationEnd, NavigationStart, Router} from "@angular/router";
import {BehaviorSubject, map, Observable, combineLatest} from "rxjs";
import {ToastModel} from "../model/toast.model";
import {ToastsService} from "./toasts.service";
import {StatusTypeEnum} from "../constants/status-type.enum";

@Injectable({
  providedIn: "root"
})
export class ShowLoaderService {
  private isLoading$ = new BehaviorSubject(false);
  private isLoadSendBtn$ = new BehaviorSubject(false);
  public isNavButtonCreated$ = new BehaviorSubject(false);
  private time: number = 800;

  constructor(private router: Router, private toastService: ToastsService) {
    this.navigationInterceptor();
  }

  public navigationInterceptor(): void {
    combineLatest([this.router.events, this.isNavButtonCreated$])
      .pipe(
        map(([navigation, btnLoading]) => {
          if (navigation instanceof NavigationStart) {
            this.isLoading$.next(true);
          }
          if (!(navigation instanceof NavigationEnd) && !(navigation instanceof NavigationEnd) && !btnLoading) {
            this.isLoading$.next(false);
          }
          if ((navigation instanceof NavigationEnd) && !btnLoading) {
            setTimeout(() => {
              this.isLoading$.next(false);
            }, this.time);
          }
        })
      )
      .subscribe();
  }

  public getIsLoading(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

  public getSendingCompanyBtn(): Observable<boolean> {
    return this.isLoadSendBtn$.asObservable();
  }

  public sendingLoaderFormCompany(): void {
    this.isLoadSendBtn$.next(true);

    setTimeout(() => {
      this.isLoadSendBtn$.next(false);
      this.toastService.setStatus$(StatusTypeEnum.success);
      this.toastService.addToast({title: ToastModel.accepted});
    }, this.time);

  }

}

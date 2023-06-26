import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable, of} from "rxjs";
import {NavigateButtonInterface, NavigationButton} from "../../modules/app/interfaces/navigateButton.interface";
import {TranslateService} from "@ngx-translate/core";
import {RobotHelperEnum} from "../../modules/app/constants/robot-helper.enum";


@Injectable({
  providedIn: "root"
})
export class NavigateButtonState {
  private navigationButtons$: BehaviorSubject<NavigationButton[] | null> =
    new BehaviorSubject<NavigationButton[] | null>(null);

  private readonly navigations: NavigateButtonInterface[] = [
    {
      "id": 1,
      "text": "",
      "icon": "specialist-icon",
      "link": "/company",
      "statusType": "default"
    },
    {
      "id": 2,
      "icon": "add-vacancy-icon",
      "text": `${this._translateService.instant("NAVIGATION.ADD_VACANCY")}`,
      "link": "/vacancy/create-filter",
      "statusType": "disabled"
    },
    {
      "id": 3,
      "text": `${this._translateService.instant("NAVIGATION.MY_VACANCY")}`,
      "icon": "my-vacancy-icon",
      "link": "/vacancies",
      "statusType": "disabled"
    },
    {
      "id": 5,
      "text": `${this._translateService.instant("NAVIGATION.SPECIALISTS")}`,
      "icon": "specialist-icon",
      "link": "/specialists",
      "statusType": "disabled"
    },
    {
      "id": 4,
      "text": `${this._translateService.instant("NAVIGATION.ANALYTICS")}`,
      "icon": "analytic-icon",
      "link": "/analytic",
      "statusType": "disabled"
    },
    {
      "id": 6,
      "icon": "balance-icon",
      "text": `${this._translateService.instant("NAVIGATION.BALANCE")}`,
      "link": "/balance",
      "statusType": "disabled"
    }
  ];

  get navigationButtons(): NavigateButtonInterface[] {
    return this.navigations;
  }

  public robotNavigationSteps = [];

  private robotNavigationSteps$ = new BehaviorSubject(this.robotNavigationSteps);

  private navigationMenu$ = of(this.navigations as NavigateButtonInterface[]);

  constructor(private readonly _translateService: TranslateService) {
  }

  public getNavigationsMenu$(): Observable<NavigateButtonInterface[]> {
    return this.navigationMenu$;
  }

  public getRobotNavigationSteps$(): Observable<any> {
    return this.robotNavigationSteps$.asObservable();
  }

  public setRobotNavigationSteps(steps: any): void {
    this.robotNavigationSteps$.next(steps);
  }

  public setShowedNavigationsMenu(value: NavigationButton[]) {
    this.navigationButtons$.next(value);
  }

  public getShowedNavigationsMenu$(): Observable<NavigationButton[] | null> {
    return this.navigationButtons$;
  }

  public getShowedNavigationsMenu(): NavigationButton[] | null {
    return this.navigationButtons$.value;
  }
}

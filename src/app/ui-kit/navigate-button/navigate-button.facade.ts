import {Injectable} from "@angular/core";
import {NavigateButtonInterface, NavigationButton} from "../../modules/app/interfaces/navigateButton.interface";
import {Observable, Subscription} from "rxjs";
import {NavigateButtonState} from "./navigate-button.state";
import {CompanyService} from "../../modules/company/company.service";

@Injectable({
  providedIn: "root"
})
export class NavigateButtonFacade {
  public getNavigationMenuSubscription: Subscription = new Subscription();

  constructor(
    private readonly _navigateButtonState: NavigateButtonState,
    private readonly _companyService: CompanyService,
  ) {
  }

  public getNavigationsMenu$(): Observable<NavigateButtonInterface[]> {
    return this._navigateButtonState.getNavigationsMenu$();
  }

  public getRobotNavigationSteps$(): Observable<any> {
    return this._navigateButtonState.getRobotNavigationSteps$();
  }

  public setRobotNavigationSteps(steps: any): void {
    this._navigateButtonState.setRobotNavigationSteps(steps);
  }

  public getShowedNavigationsMenu$(): Observable<NavigationButton[] | null> {
    return this._navigateButtonState.getShowedNavigationsMenu$();
  }

  public getShowedNavigationsMenu(): NavigationButton[] | null {
    return this._navigateButtonState.getShowedNavigationsMenu();
  }

  public setShowedNavigationsMenu$(value: NavigationButton[]){
    return this._navigateButtonState.setShowedNavigationsMenu(value);
  }

  public getNavigationsMenuItem(link: string): NavigateButtonInterface {
    let menu: NavigateButtonInterface = {} as NavigateButtonInterface;
    this.getNavigationMenuSubscription = this.getNavigationsMenu$()
      .subscribe((navigationsMenu: NavigateButtonInterface[]) => {
        const id = navigationsMenu.find((item: NavigateButtonInterface) =>
          item.link === link.replace("/", ""))?.id || {} as NavigateButtonInterface;
        if (id) {
          menu = navigationsMenu.find(item => item.id === id) || {} as NavigateButtonInterface;
        }
        this.getNavigationMenuSubscription.unsubscribe();
      });
    return menu;
  }
}

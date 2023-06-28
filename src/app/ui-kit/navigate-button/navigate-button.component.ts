import {AfterViewInit, Component, Input} from "@angular/core";
import {NavigateButtonTypesEnum} from "../../shared/enum/navigate-button-types.enum";
import {Observable} from "rxjs";
import {RobotHelper} from "../../shared/interfaces/robot-helper.interface";
import {RobotHelperService} from "../../shared/services/robot-helper.service";
import {ShowLoaderService} from "../../shared/services/show-loader.service";

@Component({
  selector: "hr-navigate-button",
  templateUrl: "./navigate-button.component.html",
  styleUrls: ["./navigate-button.component.scss"]
})
export class NavigateButtonComponent implements AfterViewInit {
  @Input("type") public typeProps: NavigateButtonTypesEnum | string = NavigateButtonTypesEnum.disabled;
  @Input("isActive") public isActive: string = "notActive";
  @Input("notification-count") public notificationCountProps: number = 0;
  @Input("text") public textProps!: string;
  @Input("link") public linkProps?: string;
  @Input("icon") public iconProps?: string;

  public navigateButtonTypesList = NavigateButtonTypesEnum;
  public isRobotOpen$: Observable<boolean> = this._robotHelperService.getIsRobotOpen();
  public robotSettings$: Observable<RobotHelper> = this._robotHelperService.getRobotSettings();

  constructor(private readonly _robotHelperService: RobotHelperService,
              private readonly _showLoaderService: ShowLoaderService
  ) {
  }

  ngAfterViewInit() {
    this._showLoaderService.isNavButtonCreated$.next(false);
  }

}

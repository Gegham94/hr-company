import {ChangeDetectionStrategy, Component} from "@angular/core";
import {EChartsOption} from "echarts/types/dist/echarts";
import {BehaviorSubject} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {ITests} from "./interfaces/tests.interface";
import {AnalyticsEnum} from "./constants/analytics.enum";
import {PassedTestsPercentages, SpecialistAnalyticsOptions} from "./mock";

@Component({
  selector: "hr-analytics",
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsComponent {
  public readonly AnalyticsEnum = AnalyticsEnum;
  public option: EChartsOption = this.getOptions();
  public passedTestsPercentages: BehaviorSubject<ITests> = new BehaviorSubject<ITests>(PassedTestsPercentages);
  public uuid!: string;
  public foundSpecialistsUuid!: string;

  constructor(
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
  ) {
    const { queryParams } = this._activatedRoute.snapshot;
    this.uuid = queryParams?.["uuid"];
    this.foundSpecialistsUuid = queryParams?.["foundSpecialistUuid"];
  }

  public openTestsList(type: string): void {
    this._router.navigate([`/specialists/profile/tests`], {queryParams: {uuid: this.uuid}}).then(r => {});
  }

  private getOptions(): EChartsOption {
    //TODO:  [60,70,80] Change, when backend will be ready
    this.option = SpecialistAnalyticsOptions([60,70,80]);
    return this.option;
  }

}

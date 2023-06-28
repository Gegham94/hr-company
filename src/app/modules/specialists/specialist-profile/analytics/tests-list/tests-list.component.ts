import {ChangeDetectionStrategy, Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {LocalStorageService} from "../../../../../shared/services/local-storage.service";
import {TestLevelEnum} from "../constants/tests-level.enum";
import {TestCategory} from "../constants/tests.enum";
import {ObjectType} from "../../../../../shared/types/object.type";

@Component({
  selector: "app-tests-list",
  templateUrl: "./tests-list.component.html",
  styleUrls: ["./tests-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestsListComponent {
  public readonly TestLevelEnum = TestLevelEnum;
  public readonly TestLevel = TestLevelEnum;
  public uuid!: string;

  public groupByCategoryOfPsychological: ObjectType = {};
  public groupByCategoryOfProgramming: ObjectType= {};
  public tests: ObjectType = {};

  constructor(
    private readonly _localStorage: LocalStorageService,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
  ) {
    this.uuid = this._route.snapshot.queryParams?.["uuid"];
  }

  public ngOnInit(): void {
    this.getTests();
  }

  private getTests(): void {
    if(this._localStorage.getItem("selectedGroupTests")){
      const data = JSON.parse(this._localStorage.getItem("selectedGroupTests"));

      this.groupByCategoryOfPsychological =
        data.reduce((group: ObjectType, product: ObjectType) => {
          const {interviewTest} = product;
          const {typeOfQuiz} = product;
          if (interviewTest?.specialist_skill_type?.name && typeOfQuiz === TestCategory.psychological) {
            group[interviewTest?.specialist_skill_type?.name] =
              group[interviewTest?.specialist_skill_type?.name] ?? [];

            group[interviewTest?.specialist_skill_type?.name] = [];
            group[interviewTest?.specialist_skill_type?.name].push(product);
          }
          return group;
        }, []);

      this.groupByCategoryOfProgramming = data.reduce((group: ObjectType, product: ObjectType) => {
        const {interviewTest} = product;
        const {typeOfQuiz} = product;
        if (interviewTest?.specialist_skill_type?.name && typeOfQuiz === TestCategory.programming) {
          group[interviewTest?.specialist_skill_type?.name] =
            group[interviewTest?.specialist_skill_type?.name] ?? [];
          group[interviewTest?.specialist_skill_type?.name].push(product);
        }
        return group;
      }, []);

      if (this.isObjectData(this.groupByCategoryOfProgramming)) {
        this.tests = this.groupByCategoryOfProgramming;
      } else if (this.isObjectData(this.groupByCategoryOfPsychological)) {
        this.tests = this.groupByCategoryOfPsychological;
      } else {
        this.tests = {};
      }
    }
  }

  public isObjectData(object: ObjectType): boolean {
    return Object.keys(object).length !== 0;
  }

  public getDate(date: string): Date {
    return new Date(date);
  }

  public openSpecialistTest(testUuid?: string): void {
    this._router.navigate([`/specialists/profile/tests/test`], {
      queryParams: {
        testId: testUuid,
        uuid: this.uuid,
      }
    });
  }
}

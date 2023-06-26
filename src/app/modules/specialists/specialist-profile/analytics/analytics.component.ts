import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {EChartsOption} from "echarts/types/dist/echarts";
import {BehaviorSubject, filter, map, Observable, takeUntil} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {Unsubscribe} from "../../../../shared-modules/unsubscriber/unsubscribe";
import {Specialist} from "../../interfaces/specialist.interface";
import {QuestionsAnswersInterface, SpecialistListsInterface} from "../../interface/specialist-test.interface";
import {ObjectType} from "../../../../shared-modules/types/object.type";
import {LocalStorageService} from "../../../app/services/local-storage.service";
import {SpecialistService} from "../../specialist.service";
import {Tests} from "./interfaces/tests.interface";
import {AnalyticsEnum} from "./constants/analytics.enum";

@Component({
  selector: "hr-analytics",
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.scss"],
})
export class AnalyticsComponent extends Unsubscribe implements OnInit, OnDestroy {

  @Input("specialist") specialist!: SpecialistListsInterface | null;
  public option!: EChartsOption;
  public employee$!: Observable<Specialist>;
  public questionAnswers$!: Observable<QuestionsAnswersInterface[]>;

  public passedTestsPercentages: BehaviorSubject<Tests> =
    new BehaviorSubject<Tests>({
      interview: {
        point: "0",
        testsCount: 0,
      },
      programming: {
        point: "0",
        testsCount: 0,
      },
      psychologic: {
        point: "0",
        testsCount: 0,
      },
    });

  public readonly AnalyticsEnum = AnalyticsEnum;
  public groupByTypeOfQuiz: ObjectType = {};
  public uuid!: string;
  public foundSpecialistsUuid!: string;

  constructor(
    private readonly _localStorage: LocalStorageService,
    private readonly _specialistService: SpecialistService,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _cdr: ChangeDetectorRef,
  ) {
    super();
    this.uuid = this._route.snapshot.queryParams?.["uuid"];
    this.foundSpecialistsUuid = this._route.snapshot.queryParams?.["foundSpecialistUuid"];
  }

  public getSpecialistCard() {
    if(this.specialist) {
      const questionAnswers = this.specialist.test_answers.map((specialistTestList: any) =>
        ({
          point: specialistTestList?.point,
          correctAnswerCount: specialistTestList?.correctAnswerCount,
          wrongAnswerCount: specialistTestList?.wrongAnswerCount,
          typeOfQuiz: specialistTestList?.interview_test?.["typeOfQuiz"],
          testUuid: specialistTestList?.questionAnswerList.testUuid,
          title: specialistTestList?.questionAnswerList.title,
          interviewTest: specialistTestList?.interview_test,
          categoryType: specialistTestList?.interview_test?.["specialist_skill_type"]?.name
        }));

      const quizzes = {
        interview: {
          point: "0",
          testsCount: 0,
        },
        programming: {
          point: "0",
          testsCount: 0,
        },
        psychologic: {
          point: "0",
          testsCount: 0,
        },
      };

      this.groupByTypeOfQuiz = questionAnswers.reduce((group: ObjectType, product: ObjectType) => {
        const {typeOfQuiz, point} = product;
        if (typeOfQuiz && point) {
          group[typeOfQuiz] = group[typeOfQuiz] ?? [];
          // @ts-ignore
          quizzes[typeOfQuiz].point = +quizzes[typeOfQuiz].point + (+(product?.["point"]));
          // @ts-ignore
          quizzes[typeOfQuiz].testsCount += 1;

          group[typeOfQuiz].push(product);
        }
        return group;
      }, {});

      quizzes["interview"].point = quizzes["interview"].testsCount ? quizzes["interview"].point : "0";

      quizzes["psychologic"].point = quizzes["psychologic"].testsCount ? quizzes["psychologic"].point : "0";

      quizzes["programming"].point = quizzes["programming"].testsCount ? quizzes["programming"].point : "0";

      this.passedTestsPercentages.next(quizzes);
      this.getOptions();
      this._cdr.detectChanges();
    }

  }

  public ngOnInit(): void {
    this.getOptions();
    this.getSpecialistCard();
  }

  public openTestsList(type: string) {
    this._localStorage.setItem("selectedGroupTests", JSON.stringify(this.groupByTypeOfQuiz[type]));
    this._router.navigate([`/specialists/profile/tests`], {queryParams: {uuid: this.uuid}});
  }

  public get allTestsCount(): number {
    let sum = 0;
    // tslint:disable-next-line:forin
    for (const key in this.passedTestsPercentages.value) {
      // @ts-ignore
      sum += this.passedTestsPercentages.value[key].testsCount;
    }
    return sum;
  }

  public get chartPercentages(): number[] {
    let sumPercentages = 0;
    const chartPercentages = [];
    // tslint:disable-next-line:forin
    for (const key in this.passedTestsPercentages.value) {
      // @ts-ignore
      sumPercentages += +(this.passedTestsPercentages.value[key].point);
    }
    // tslint:disable-next-line:forin
    for (const key in this.passedTestsPercentages.value) {
      // @ts-ignore
      chartPercentages.push(+((this.passedTestsPercentages.value[key].point * 100) / sumPercentages).toFixed(2));
    }
    return chartPercentages;
  }

  private getOptions(): void {
    this.option = {
        tooltip: {
          trigger: "item",
          formatter: (param: any) => {
            return ` <span style="display:inline-block;
                      margin-left:5px;border-radius:10px;
                      width:9px;height:9px;
                      background-color:${param.color};"></span>
                      ${param.seriesName} - ${param.value} %`;
          }
        },
      xAxis: {
        data: ["Собеседование", "Тест компилятора", "Теоретически тест"],
     },
     yAxis: {
      type: "value",
     },
     legend: {
      data: ["Проваленные вопросы"]
    },
    title: {
      subtext: "в процентах"
    },
      series: [
        {
          name: "Пройденные тесты",
          type: "bar",
          stack: "total",
          label: {
            show: true
          },
          emphasis: {
            focus: "series"
          },
          data: [40, 30, 50],
            itemStyle: {
                color: function(params) {
                  const colorList = ["#33bb47", "#008FFB", "#FF4560"];
                  return colorList[params.dataIndex];
                }
              }
        },
        {
          name: "Проваленные вопросы",
          type: "bar",
          stack: "total",
          label: {
            show: true
          },
           color: ["#b8b8b8"],

          emphasis: {
            focus: "series"
          },
          data: [60, 70, 50]
        },
      ],
      animation: true,
    };
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

}

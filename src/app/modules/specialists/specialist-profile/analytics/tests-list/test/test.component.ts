import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {map, Observable, takeUntil} from "rxjs";
import {ISpecialistAnswers} from "../../interfaces/tests.interface";
import {SpecialistService} from "../../../../services/specialist.service";
import {Unsubscribe} from "../../../../../../shared-modules/unsubscriber/unsubscribe";

@Component({
  selector: "app-tests",
  templateUrl: "./test.component.html",
  styleUrls: ["./test.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponent extends Unsubscribe implements OnInit, OnDestroy {
  public question$!: Observable<ISpecialistAnswers[]>;
  public questionsCount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private service: SpecialistService) {
    super();
  }

  public ngOnInit(): void {
    const userId = this.route.snapshot.queryParams?.["uuid"];
    const testId = this.route.snapshot.queryParams?.["testId"];

    this.question$ = this.service.getSpecialistCard(userId)
      .pipe(takeUntil(this.ngUnsubscribe),
        map((specialistData) =>
          specialistData?.specialist?.test_answers.find(
            (specTest) => specTest.questionAnswerList.testUuid === testId)
        ),
        map((specialist) => {
            const questionsList = specialist?.questionAnswerList?.questions;
            const elem = [];
            // tslint:disable-next-line:forin
            for (const questionsListKey in questionsList) {
              // @ts-ignore
              const question = questionsList[questionsListKey];
              elem.push({
                answerId: question?.answerId,
                answersList: question?.answersList,
                isCorrect: question?.isCorrect,
                specialistAnswer: question?.specialistAnswer,
                question: question?.question
              });
            }
            this.questionsCount = elem.length;
            return elem;
          }
        )
      );
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}

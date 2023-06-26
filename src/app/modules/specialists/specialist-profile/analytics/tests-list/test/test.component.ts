import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {map, Observable} from "rxjs";
import {SpecialistAnswers} from "../../interfaces/tests.interface";
import {SpecialistService} from "../../../../specialist.service";

@Component({
  selector: "app-tests",
  templateUrl: "./test.component.html",
  styleUrls: ["./test.component.scss"]
})
export class TestComponent implements OnInit {
  public question$!: Observable<SpecialistAnswers[]>;
  public questionsCount: number = 0;

  constructor(private route: ActivatedRoute, private service: SpecialistService) {
  }

  ngOnInit(): void {
    const userId = this.route.snapshot.queryParams?.["uuid"];
    const testId = this.route.snapshot.queryParams?.["testId"];

    this.question$ = this.service.getSpecialistCard(userId)
      .pipe(
        map((spec) => spec?.specialist?.test_answers.find(
          (specTest) => specTest.questionAnswerList.testUuid === testId)
        ),
        map((specialist: any) => {
            const questionsList = specialist?.questionAnswerList?.questions;
            const elem = [];
            // tslint:disable-next-line:forin
            for (const questionsListKey in questionsList) {
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

}

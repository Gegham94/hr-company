import {ObjectType} from "../../../../../shared/types/object.type";
import {ISpecialist} from "../../interfaces/specialist.interface";

export interface SpecialistTestInterface {
  specialist: ISpecialist;
}

export interface IQuestionAnswerList {
  correctAnswerCount: number;
  createdAt: string;
  foundCompanySpecialistUuid: string;
  interview_test: ObjectType;
  point: number;
  questionAnswerList: IQuestionsAnswersInterface;
  specialistUuid: string;
  testUuid: string;
  updatedAt: string;
  uuid: number;
  vacancyUuid: number;
  wrongAnswerCount: number;
}

export interface ITestAnswer {
  correctAnswerCount: number;
  createdAt: string;
  foundCompanySpecialistUuid: string;
  interview_test: ObjectType;
  point: number;
  questionAnswerList: ObjectType;
  specialistUuid: string;
  testUuid: string;
  updatedAt: string;
  uuid: number;
  vacancyUuid: number;
  wrongAnswerCount: number;
}
export interface IQuestionsAnswersInterface {
  typeOfQuiz?: string;
  questions?: ISpecialistAnswers;
  testUuid?: string;
  title?: string;
  point?: number;
  category?: string;
}

export interface IGroupedTests {
  Intelligence?: IQuestionAnswerList[];
  Personality?: IQuestionAnswerList[];
  "Stress tolerance"?: IQuestionAnswerList[];
}
export interface ISpecialistAnswers {
  answerId: 1;
  answersList: IAnswersList[];
  isCorrect: boolean;
  question: string;
  specialistAnswer: string;
}

export interface IAnswersList {
  id: number;
  answer: string;
  is_correct: boolean;
}

export interface ITests {
  psychologic: {
    point: string;
    testsCount: number;
  };
  programming: {
    point: string;
    testsCount: number,
  };
  interview: {
    point: string;
    testsCount: number,
  };
}

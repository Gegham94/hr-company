import {ObjectType} from "../../../shared/types/object.type";
import { ISpecialist } from "../specialist-profile/interfaces/specialist.interface";

export interface ISpecialistTest {
  specialist: ISpecialist;
}

export interface IRejectedOrAccepted {
  availableSpecialist: string;
  createdAt: string;
  deletedAt: string | number | Date;
  interviewDate: string | number | Date;
  interviewStatus: "accepted" | "rejected";
  interviewTime: string | number;
  isFavorite: boolean;
  newSpecialist: boolean;
  specialistUuid: string;
  updatedAt: string;
  uuid: string;
  vacancyUuid: string;
}
export interface ISpecialistLists {
  citizenship: string;
  city: string;
  country: string;
  email: string;
  employment: string;
  image: string;
  image_blured: string;
  languages: "[]";
  languagesFrameworksArray: "[]";
  languagesFrameworksObjects: "{}";
  name: string;
  phone: string;
  surname: string;
  test_answers: IQuestionAnswerList[];
  uuid: string;
  found_specialist_for_company_rejected: IRejectedOrAccepted[];
  found_specialist_for_company_succeed: IRejectedOrAccepted[]
}

export interface IQuestionAnswerList {
  correctAnswerCount: number;
  createdAt: string;
  foundCompanySpecialistUuid: string;
  interview_test: ObjectType;
  point: number;
  questionAnswerList: IQuestionsAnswers;
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
export interface IQuestionsAnswers {
  typeOfQuiz?: string;
  questions?: ISpecialistAnswers;
  testUuid?: string;
  title?: string;
  point?: number;
  category?: string;
}

export interface ISpecialistAnswers {
  answerId: 1;
  answersList:IAnswersList[];
  isCorrect: boolean;
  question: string;
  specialistAnswer: string;
}

export interface IAnswersList {
  id: number;
  answer: string;
  is_correct: boolean;
}

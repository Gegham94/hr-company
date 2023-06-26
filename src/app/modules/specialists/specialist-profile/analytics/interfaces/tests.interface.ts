import {ObjectType} from "../../../../../shared-modules/types/object.type";

export interface SpecialistTestInterface {
  specialist: SpecialistListsInterface;
}

export interface SpecialistListsInterface {
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
  test_answers: QuestionAnswerList[];
  uuid: string;
}

export interface QuestionAnswerList {
  correctAnswerCount: number;
  createdAt: string;
  foundCompanySpecialistUuid: string;
  interview_test: ObjectType;
  point: number;
  questionAnswerList: QuestionsAnswersInterface;
  specialistUuid: string;
  testUuid: string;
  updatedAt: string;
  uuid: number;
  vacancyUuid: number;
  wrongAnswerCount: number;
}

export interface TestAnswer {
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
export interface QuestionsAnswersInterface {
  typeOfQuiz?: string;
  questions?: SpecialistAnswers;
  testUuid?: string;
  title?: string;
  point?: number;
  category?: string;
}

export interface GroupedTests {
  Intelligence?: QuestionAnswerList[];
  Personality?: QuestionAnswerList[];
  "Stress tolerance"?: QuestionAnswerList[];
}
export interface SpecialistAnswers {
  answerId: 1;
  answersList:AnswersList[];
  isCorrect: boolean;
  question: string;
  specialistAnswer: string;
}

export interface AnswersList {
  id: number;
  answer: string;
  is_correct: boolean;
}

export interface Tests {
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

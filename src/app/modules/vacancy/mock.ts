import {LanguagesEnum} from "./constants/languages.enum";
import {SearchableSelectDataInterface} from "../app/interfaces/searchable-select-data.interface";
import {EmploymentTypeEnum} from "./constants/employment-type.enum";
import {LevelEnum, ProgrammingLevelEnum} from "./constants/programming-level.enum";
import {WorkplaceEnum} from "./constants/workplace.enum";


export const languages: SearchableSelectDataInterface[] = [
  {
    id: 1,
    value: LanguagesEnum.english,
    displayName: LanguagesEnum.english
  },
  {
    id: 2,
    value: LanguagesEnum.russian,
    displayName: LanguagesEnum.russian
  }
];

export const employmentTypes: SearchableSelectDataInterface[] = [
  {
    id: 1,
    value: EmploymentTypeEnum.fullTime,
    displayName: EmploymentTypeEnum.fullTime
  },
  {
    id: 2,
    value: EmploymentTypeEnum.partTime,
    displayName: EmploymentTypeEnum.partTime
  },
  {
    id: 3,
    value: EmploymentTypeEnum.remote,
    displayName: EmploymentTypeEnum.remote
  }
];

export const programmingLevels: SearchableSelectDataInterface[] = [
  {
    id: 1,
    value: LevelEnum.INTERN,
    displayName: ProgrammingLevelEnum.intern
  },
  {
    id: 2,
    value: LevelEnum.JUNIOR,
    displayName: ProgrammingLevelEnum.junior
  },
  {
    id: 3,
    value: LevelEnum.MIDDLE,
    displayName: ProgrammingLevelEnum.middle
  },
  {
    id: 4,
    value: LevelEnum.SENIOR,
    displayName: ProgrammingLevelEnum.senior
  },
  {
    id: 5,
    value: LevelEnum.LEAD,
    displayName: ProgrammingLevelEnum.lead
  }
];

export const workplace: SearchableSelectDataInterface[] = [
  {
    id: 1,
    value: WorkplaceEnum.fromOffice,
    displayName: WorkplaceEnum.fromOffice
  },
  {
    id: 2,
    value: WorkplaceEnum.remote,
    displayName: WorkplaceEnum.remote
  },
  {
    id: 3,
    value: WorkplaceEnum.hybrid,
    displayName: WorkplaceEnum.hybrid
  }
];
export const price: SearchableSelectDataInterface[] = [
  {id: 0, value: "EUR", displayName: "EUR"},
  {id: 1, value: "RUB", displayName: "RUB"},
  {id: 2, value: "USD", displayName: "USD"}
];

export const QuestionForInterview = [{
  language: "PHP",
  frameworks: ["Ларавел"],
  questions: [
    {
      title: "Ларавел",
      questions: [
        "Что такое PHP?",
        "Каковы преимущества использования PHP?",
        "В чем разница между эхом и печатью в PHP?",
        "Какая польза от функции isset() в PHP?",
        "Объясните разницу между методами GET и POST в PHP.",
        "Какая польза от функции взрыва() в PHP?",
        "Как вы обрабатываете ошибки в PHP?",
      ]
    }
  ]
},
  {
    language: "JS",
    frameworks: ["Angular, React"],
    questions: [
      {
        title: "Angular",
        questions: [
          "What is Angular? How does it differ from AngularJS?",
          "Explain the Angular component lifecycle hooks.",
          "What are modules in Angular? How are they used?",
          "What is data binding in Angular? Explain the different types of data binding.",
          "What is dependency injection in Angular? How does it work?",
        ]
      },
      {
        title: "React",
        questions: [
          "What is React? How does it differ from other JavaScript frameworks?",
          "Explain the concept of virtual DOM in React and its advantages.",
          "What are React components? Explain the difference between functional components and class components.",
          "What is JSX in React? How does it blend HTML with JavaScript?",
          "Explain the component lifecycle methods in React and their usage."
        ]
      }
    ]
  },
];

export class Questions {
  question: string | undefined;
}

export interface ILanguage {
  language: string;
  frameworks: string[];
}

export interface ISendLanguages {
  languages: ILanguage[];
}

export interface IQuestion {
  title: string;
  questions: string[];
}

export interface IGetQuestions {
  language: string;
  frameworks: string[];
  questions: IQuestion[];
}

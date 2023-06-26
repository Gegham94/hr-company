export interface ISignUpRequest {
  password: string;
  phone: string;
  policy: string;
}

export type SignUpRequestKeys = "password" | "phone" | "policy";

export type SignUpError = {
  messages?: {
    [key in SignUpRequestKeys]: string;
  };
  message?: string;
  statusCode: number;
};

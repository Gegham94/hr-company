export interface ISignUpRequest {
  password: string;
  phone: string;
  policy: string;
}

export type SignUpRequestKeysType = "password" | "phone" | "policy";

export type SignUpErrorType = {
  messages?: {
    [key in SignUpRequestKeysType]: string;
  };
  message?: string;
  statusCode: number;
};

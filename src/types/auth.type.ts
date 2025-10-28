export interface EmailData{
    email:string;
    name:string;
}

export interface VerifyEmailBody{
    email:string;
    token:string
}
export interface ISession {
  id: string;
  userId: string;
  refreshToken: string | null;
  expiredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
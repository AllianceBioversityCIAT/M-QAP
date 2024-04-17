export type EmailType = {
  id: number;

  creation_date?: string;

  update_date?: string;

  name: string;

  subject: string;

  email: string;

  status: boolean;

  limit_exceeded: boolean;

  email_body: string;
};

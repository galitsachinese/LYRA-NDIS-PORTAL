export interface ContactEnquiry {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  message: string;
  isRead: boolean;
  submittedAt: string;
}
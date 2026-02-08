export interface SendMeetingOptions {
  to: string;
  recipientType: "client" | "admin";
  meetingLink: string;
  meetingDetails?: any;
}

export interface SendPDFOptions {
    to: string;
    subject?: string;
    type: "booking" | "healthPlan";
    pdfFilename: string;
}
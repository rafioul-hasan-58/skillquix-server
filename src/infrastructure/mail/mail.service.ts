import config from "../../config";
import { transporter } from "./mail.config";
import { AuthTemplates } from "./Templates/AuthTemplates";
import { ContactMessageTemplates } from "./Templates/ContactMessageTemplate";
import { GigTemplates } from "./Templates/GigTemplates";

const sendEmail = async (to: string, otp: string, subject: string) => {
    const formattedDate = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date());

    let html: string;
    html = AuthTemplates.otp(otp, formattedDate);

    const res = await transporter.sendMail({
        from: `${config.smtp.name} <${config.smtp.email_from}>`,
        to,
        subject,
        html,
    });
    return res
};

const sendApplyGigConfirmation = async (to: string, name: string, subject: string) => {

    const html = GigTemplates.applyGig(name);

    const res = await transporter.sendMail({
        from: `${config.smtp.name} <${config.smtp.email_from}>`,
        to,
        subject,
        html,
    });
    return res
};

const sendContactMessage = async (payload: {
    name: string;
    email: string;
    phoneNumber?: string;
    organization?: string;
    message: string;
    messageCategory: string;
}) => {
    const html = ContactMessageTemplates.supportEmail(payload);

    const res = await transporter.sendMail({
        from: `${config.smtp.name} <${config.smtp.email_from}>`,
        to: config.admin.contact_email, // sends to your own support email
        subject: `New Support Message - ${payload.messageCategory.replace(/_/g, " ")}`,
        html,
    });
    return res
};

export const mailService = {
    sendEmail,
    sendApplyGigConfirmation,
    sendContactMessage,
}



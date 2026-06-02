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
        to: config.admin.contact_email,
        subject: `New Support Message - ${payload.messageCategory.replace(/_/g, " ")}`,
        html,
    });
    return res
};

const sendFeedBack = async (payload: {
    name: string;
    email: string;
    message: string;
    createdAt: string;
}) => {
    const date = new Date(payload.createdAt);

    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
    const html = ContactMessageTemplates.sendFeedBack({ ...payload, formattedDate, formattedTime });

    const res = await transporter.sendMail({
        from: `${config.smtp.name} <${config.smtp.email_from}>`,
        to: "rafioulhasan2@gmail.com",
        subject: `New Feedback Received`,
        html,
    });
    return res
};

export const mailService = {
    sendEmail,
    sendApplyGigConfirmation,
    sendContactMessage,
    sendFeedBack
}



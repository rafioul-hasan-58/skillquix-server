import config from "../../config";
import { transporter } from "./mail.config";
import { AuthTemplates } from "./Templates/AuthTemplates";
import { GigTemplates } from "./Templates/GigTemplates";

export const mailService = {
    sendEmail: async (to: string, otp: string, subject: string) => {
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
    },
    sendApplyGigConfirmation: async (to: string, name: string, subject: string) => {


        const html = GigTemplates.applyGig(name);

        const res = await transporter.sendMail({
            from: `${config.smtp.name} <${config.smtp.email_from}>`,
            to,
            subject,
            html,
        });
        return res
    },

}


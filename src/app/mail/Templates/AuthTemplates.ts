export const AuthTemplates = {
  otp: (otp: string | number, formattedDate: string) => `
  <div style="max-width: 600px; margin: 0 auto; background-color: #000721; color: #333; border-radius: 8px; padding: 24px;">
    <table style="width: 100%;">
      <tr>
        <td>
          <img src="https://res.cloudinary.com/shariful10/image/upload/v1749700233/yldrmw7kojhei2lddt8k.png"
            alt="logo"
            style="height: 40px;" />
        </td>
        <td style="text-align: right; color: #999;">${formattedDate}</td>
      </tr>
    </table>

    <h2 style="text-align: center; color: #ffffff;">
      Verify Your OTP Within 10 Minutes
    </h2>

    <p style="text-align: center; font-size: 24px; color: #fff;">
      <strong>${otp}</strong>
    </p>
  </div>
  `,

  resetPassword: (resetLink: string, formattedDate: string) => `
  <div style="max-width: 600px; margin: 0 auto; background-color: #000721; color: #333; border-radius: 8px; padding: 24px;">
    <table style="width: 100%;">
      <tr>
        <td>
          <img src="https://res.cloudinary.com/shariful10/image/upload/v1749700233/yldrmw7kojhei2lddt8k.png"
            alt="logo"
            style="height: 40px;" />
        </td>
        <td style="text-align: right; color: #999;">${formattedDate}</td>
      </tr>
    </table>

    <h2 style="text-align: center; color: #ffffff;">
      Reset Your Password Within 10 Minutes
    </h2>

    <p style="color: #fff;">
      Click <a href="${resetLink}" style="color:#4da3ff;">here</a> to reset your password.
    </p>
  </div>
  `,
};
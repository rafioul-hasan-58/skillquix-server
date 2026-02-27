import bcrypt from "bcrypt";
import axios from "axios";
import FormData from "form-data";
import config from "../../../config";

export const hashPassword = async (password: string): Promise<string> => {
	return await bcrypt.hash(password, 12);
};
export const parseResumeFromS3 = async (
	s3Url: string,
	userId: string
) => {
	try {
		// 1️⃣ Download file from S3 as buffer
		const fileResponse = await axios.get(s3Url, {
			responseType: "arraybuffer",
		});

		// 2️⃣ Create multipart form
		const form = new FormData();
		form.append("user_id", userId);
		form.append("resume_text", null)
		form.append("file", Buffer.from(fileResponse.data), {
			filename: "resume.pdf", // you can make dynamic if needed
			contentType: "application/pdf",
		});

		// 3️⃣ Send to resume parse API
		const response = await axios.post(
			"http://187.77.210.157:8888/v1/resume-parse",
			form,
			{
				headers: {
					...form.getHeaders(),
				},
				maxBodyLength: Infinity,
			}
		);

		// return response.data;
		console.log("data", response.data)
	} catch (error: any) {
		console.log("STATUS:", error.response?.status);
		console.log("DATA:", error.response?.data);
		throw error;
	}
};
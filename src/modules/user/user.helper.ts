import bcrypt from "bcrypt";
import FormData from "form-data";
import { downloadFileFromS3 } from "../../lib/S3Uploader";
import axios from "axios";
import config from "../../config";
import { aiClient } from "../../infrastructure/ai/aiClient";
import { AI_ENDPOINTS } from "../../infrastructure/ai/aiEndpoints";

export const hashPassword = async (password: string): Promise<string> => {
	return await bcrypt.hash(password, 12);
};

export const parseResume = async (fileUrl: string) => {
	const { blob, fileName, mimeType } = await downloadFileFromS3(fileUrl);

	const buffer = Buffer.from(await blob.arrayBuffer());

	const formData = new FormData();
	formData.append('user_id', null);
	formData.append('resume_text', null);
	formData.append('file', buffer, { filename: fileName, contentType: mimeType });

	const { data } = await aiClient.post(
		AI_ENDPOINTS.USER.RESUME_PARSE,
		formData,
		{
			headers: {
				...formData.getHeaders(),
			}
		}
	);
	return data
};


export const getClearityScore = async (userId: string) => {

	const { data } = await aiClient.get(
		AI_ENDPOINTS.USER.CLEARITY_SCORE(userId),
		{}
	);

	return data
};

export const getClarityPercentageChange = (
	clarity: any
): number => {
	const current = clarity?.currentMonth?.score ?? 0;
	const previous = clarity?.previousMonth?.score ?? 0;

	if (previous === 0) {
		return current > 0 ? 100 : 0;
	}

	const percentage = ((current - previous) / previous) * 100;

	return Number(percentage.toFixed(2));
};

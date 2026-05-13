import { UserRole } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import config from "../../config";

export type IJwtPayload = {
	id?: string;
	fullName?: string;
	email: string;
	profileImage?: string | null;
	role: UserRole
};

export const createToken = (
	jwtPayload: IJwtPayload,
	secret: string,
	expiresIn: string
) => {
	return jwt.sign(
		jwtPayload,
		secret as jwt.Secret,
		{
			expiresIn: expiresIn as string,
		} as jwt.SignOptions
	);
};

export const verifyToken = (token: string, secret: string): JwtPayload => {
	return jwt.verify(token, secret) as JwtPayload;
};

export const googleClient = new OAuth2Client(config.google.oauth.client_id);

export const verifyGoogleToken = async (token: string) => {
	try {
		const ticket = await googleClient.verifyIdToken({
			idToken: token,
			audience: config.google.oauth.client_id,
		});
		const payload = ticket.getPayload();

		return {
			fullName: payload?.name,
			email: payload?.email,
			profilePic: payload?.picture,
			role: UserRole.USER
		}
	} catch (error) {
		console.log("GOOGLE ERROR:", error);
		throw error;
	}
};
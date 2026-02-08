import { userRole } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";

export type IJwtPayload = {
	id?: string;
	fullName?: string;
	email: string;
	profileImage?: string | null;
	role: userRole
};

export const createToken = (
	jwtPayload: IJwtPayload,
	secret: string,
	expiresIn: string
) => {
	console.log('secret',secret)
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

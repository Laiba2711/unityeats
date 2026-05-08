import { getIronSession, type IronSession } from "iron-session";
import type { Request, Response } from "express";

export type SessionData = {
  userId?: string;
};

const SESSION_PASSWORD = "unityeats-secure-session-secret-at-least-32-chars";

export async function getSession(
  req: Request,
  res: Response,
): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(req, res, {
    password: SESSION_PASSWORD,
    cookieName: "shared_cart_sess",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 14,
      path: "/",
    },
  });
}

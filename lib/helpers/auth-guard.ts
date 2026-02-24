import type { NextRequest } from "next/server";
import { getServerSession, type SessionUser } from "../auth";

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

type SessionWithUser = {
  user?: SessionUser & { [key: string]: unknown };
};

export async function requireAdmin() {
  const session = (await getServerSession()) as SessionWithUser | null;

  if (!session || !session.user) {
    throw new AuthError("Unauthorized", 401);
  }

  if (session.user.role !== "admin") {
    throw new AuthError("Forbidden", 403);
  }

  return session.user;
}

export async function requireRole(
  _request: NextRequest,
  roles: string[],
): Promise<SessionUser> {
  const session = (await getServerSession()) as SessionWithUser | null;

  if (!session || !session.user) {
    throw new AuthError("Unauthorized", 401);
  }

  if (!roles.includes(session.user.role as string)) {
    throw new AuthError("Forbidden", 403);
  }

  return session.user;
}


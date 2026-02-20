import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, AuthorizeResponse } from "better-auth/plugins";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin", "teacher"],
      roles: {
        admin: {
          authorize: () => ({ success: true }),
          statements: [],
        },
        teacher: {
          authorize: () => ({ success: true }),
          statements: [],
        },
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins: async (request) => {
    const baseOrigin = process.env.BETTER_AUTH_URL || "http://localhost:3000";
    if (!request) {
      return [baseOrigin];
    }
    const origin = request.headers.get("origin");
    if (origin) {
      return [baseOrigin, origin];
    }
    return [baseOrigin];
  },
});

export type Session = typeof auth.$Infer.Session;

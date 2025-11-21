import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@repo/db";
import bcrypt from "bcrypt";
import { Session, TokenSet } from "next-auth";

export const AUTH_PROVIDER = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) return null;

        try {
          const existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (!existingUser) return null;

          const passwordValid = await bcrypt.compare(
            password,
            existingUser.password
          );
          if (!passwordValid) return null;

          return {
            id: existingUser.id.toString(),
            email: existingUser.email,
            name: existingUser.name,
          };
        } catch (err) {
          console.error("Login error:", err);
          return null;
        }
      },
    }),
  ],
  secret: process.env.JWT_SECRET,
  callbacks: {
    session: ({ session, token }: { session: Session; token: TokenSet }) => {
      if (session && session.user) {
        (session.user as { id: string }).id = token.sub as string;
      }

      return session;
    },
  },
};

import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import Ambassador from "@/models/Ambassador";

async function authenticateCredentials({ email, password }) {
  const normalizedEmail = email?.toLowerCase().trim();
  const sanitizedPassword = password ?? "";

  if (!normalizedEmail || !sanitizedPassword) {
    throw new Error("Email and password are required");
  }

  await connectDB();
  const ambassador = await Ambassador.findOne({ email: normalizedEmail });

  if (!ambassador) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(sanitizedPassword, ambassador.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  return ambassador;
}

function serializeUser(ambassador) {
  return {
    id: ambassador._id.toString(),
    email: ambassador.email,
    name: ambassador.name,
    referralCode: ambassador.referralCode,
    totalReferrals: ambassador.totalReferrals ?? 0,
    role: ambassador.role,
  };
}

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const ambassador = await authenticateCredentials({
          email: credentials?.email,
          password: credentials?.password,
        });
        return serializeUser(ambassador);
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.referralCode = user.referralCode;
        token.totalReferrals = user.totalReferrals;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.referralCode = token.referralCode;
        session.user.totalReferrals = token.totalReferrals;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export { authenticateCredentials };

import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import Ambassador from "@/models/Ambassador";
import Admin from "@/models/Admin";

function buildAmbassadorUser(ambassador) {
  return {
    id: ambassador._id.toString(),
    email: ambassador.email,
    name: ambassador.name,
    referralCode: ambassador.referralCode,
    totalReferrals: ambassador.totalReferrals ?? 0,
    manualPoints: ambassador.manualPoints ?? 0,
    role: ambassador.role ?? "ambassador",
  };
}

function buildAdminUser(admin) {
  return {
    id: admin._id.toString(),
    email: admin.email,
    name: admin.name,
    referralCode: null,
    totalReferrals: 0,
    manualPoints: 0,
    role: "admin",
  };
}

async function authenticateCredentials({ email, password }) {
  const normalizedEmail = email?.toLowerCase().trim();
  const sanitizedPassword = password ?? "";

  if (!normalizedEmail || !sanitizedPassword) {
    throw new Error("Email and password are required");
  }

  await connectDB();

  const admin = await Admin.findOne({ email: normalizedEmail });
  if (admin) {
    const isAdminPasswordValid = await bcrypt.compare(sanitizedPassword, admin.password);
    if (!isAdminPasswordValid) {
      throw new Error("Invalid credentials");
    }
    return buildAdminUser(admin);
  }

  const ambassador = await Ambassador.findOne({ email: normalizedEmail });
  if (!ambassador) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(sanitizedPassword, ambassador.password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  return buildAmbassadorUser(ambassador);
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
        const user = await authenticateCredentials({
          email: credentials?.email,
          password: credentials?.password,
        });
        return user;
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
        token.referralCode = user.referralCode ?? null;
        token.totalReferrals = user.totalReferrals ?? 0;
        token.manualPoints = user.manualPoints ?? 0;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.referralCode = token.referralCode ?? null;
        session.user.totalReferrals = token.totalReferrals ?? 0;
        session.user.manualPoints = token.manualPoints ?? 0;
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

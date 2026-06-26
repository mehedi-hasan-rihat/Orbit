"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSession, clearSession, type SessionPayload } from "@/lib/auth";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { redirect } from "next/navigation";
import { z } from "zod";
import { randomUUID } from "crypto";
import {
  ok,
  validationError,
  fieldError,
  conflict,
  notFound,
  expired,
  serverError,
  unauthorized,
} from "@/lib/response";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

// ─── Register ────────────────────────────────────────────────────────────────

export async function registerAction(formData: FormData) {
  try {
    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success)
      return validationError(
        parsed.error.flatten().fieldErrors as Record<string, string[]>,
      );

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.emailVerified) return conflict("Email already in use.");

    const hashedPassword = await bcrypt.hash(password, 12);
    const token = randomUUID();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (existing && !existing.emailVerified) {
      // Resend verification for existing unverified account
      await prisma.user.update({
        where: { email },
        data: { name, verificationToken: token, verificationExpiry: expiry },
      });
    } else {
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          emailVerified: false,
          verificationToken: token,
          verificationExpiry: expiry,
        },
      });
    }

    // Fire email without blocking — user gets fast response regardless
    sendVerificationEmail({ to: email, name, token }).catch((err) =>
      console.error("[register] failed to send verification email:", err),
    );
    return ok({ email });
  } catch (err) {
    return serverError(err);
  }
}

// ─── Verify email ─────────────────────────────────────────────────────────────

export async function verifyEmailAction(token: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });
    if (!user) return notFound("Invalid or expired verification link.");

    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      return expired("This verification link has expired.", {
        email: user.email,
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    await setSession({ userId: user.id, email: user.email, name: user.name });
  } catch (err) {
    return serverError(err);
  }
  redirect("/dashboard");
}

// ─── Resend verification ──────────────────────────────────────────────────────

export async function resendVerificationAction(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return notFound("No account found for this email.");
    if (user.emailVerified)
      return conflict("Email already verified. Please sign in.");

    const token = randomUUID();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: token, verificationExpiry: expiry },
    });

    sendVerificationEmail({ to: email, name: user.name, token }).catch((err) =>
      console.error("[resend] failed to send verification email:", err),
    );
    return ok();
  } catch (err) {
    return serverError(err);
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(formData: FormData) {
  let sessionPayload: SessionPayload | null = null;

  try {
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success)
      return validationError(
        parsed.error.flatten().fieldErrors as Record<string, string[]>,
      );

    const { email, password } = parsed.data;
    console.log("[login] attempt for:", email);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("[login] no user found for:", email);
      return unauthorized("Invalid email or password.");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log("[login] wrong password for:", email);
      return unauthorized("Invalid email or password.");
    }

    console.log("[login] user found — emailVerified:", user.emailVerified);

    if (!user.emailVerified) {
      // Re-issue a fresh verification token and send email
      const token = randomUUID();
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await prisma.user.update({
        where: { id: user.id },
        data: { verificationToken: token, verificationExpiry: expiry },
      });
      sendVerificationEmail({ to: email, name: user.name, token }).catch((err) =>
        console.error("[login] failed to resend verification email:", err),
      );
      console.log("[login] blocked — email not verified, resent verification to:", email);
      return fieldError("email", "Please verify your email before signing in.");
    }

    console.log("[login] credentials OK — setting session for userId:", user.id);
    sessionPayload = { userId: user.id, email: user.email, name: user.name };
  } catch (err) {
    console.error("[login] unexpected error:", err);
    return serverError(err);
  }

  // setSession and redirect must be outside try/catch
  console.log("[login] calling setSession...");
  await setSession(sessionPayload);
  console.log("[login] session set — redirecting to /dashboard");
  redirect("/dashboard");
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

// ─── Forgot password ──────────────────────────────────────────────────────────

export async function forgotPasswordAction(formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    if (!email) return fieldError("email", "Email is required.");

    const user = await prisma.user.findUnique({ where: { email } });

    // Dev: log why we're returning early
    if (process.env.NODE_ENV === "development") {
      if (!user) console.log("[forgot-password] no user found for:", email);
      else if (!user.emailVerified)
        console.log("[forgot-password] user not verified:", email);
      else console.log("[forgot-password] sending reset to:", email);
    }

    // Always ok — prevents user enumeration
    if (!user || !user.emailVerified) return ok();

    const token = randomUUID();
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpiry: expiry },
    });

    sendPasswordResetEmail({ to: email, name: user.name, token }).catch((err) =>
      console.error("[forgot-password] failed to send reset email:", err),
    );
    return ok();
  } catch (err) {
    return serverError(err);
  }
}

// ─── Reset password ───────────────────────────────────────────────────────────

export async function resetPasswordAction(formData: FormData) {
  let sessionPayload: SessionPayload | null = null;

  try {
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (!token) return notFound("Invalid reset link.");
    if (!password || password.length < 8)
      return fieldError("password", "Password must be at least 8 characters.");
    if (password !== confirm)
      return fieldError("confirm", "Passwords do not match.");

    const user = await prisma.user.findUnique({
      where: { passwordResetToken: token },
    });
    if (!user || !user.passwordResetExpiry)
      return notFound("Reset link is invalid or has expired.");
    if (user.passwordResetExpiry < new Date())
      return expired("Reset link has expired.");

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    sessionPayload = { userId: user.id, email: user.email, name: user.name };
  } catch (err) {
    return serverError(err);
  }

  // Auto-login after password reset
  await setSession(sessionPayload);
  redirect("/dashboard");
}

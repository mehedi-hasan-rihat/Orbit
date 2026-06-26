import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/verify-email?error=missing", request.url));
  }

  const user = await prisma.user.findUnique({ where: { verificationToken: token } });

  if (!user) {
    return NextResponse.redirect(new URL("/verify-email?error=invalid", request.url));
  }

  if (user.verificationExpiry && user.verificationExpiry < new Date()) {
    return NextResponse.redirect(
      new URL(`/verify-email?error=expired&email=${encodeURIComponent(user.email)}`, request.url)
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationToken: null, verificationExpiry: null },
  });

  await setSession({ userId: user.id, email: user.email, name: user.name });

  return NextResponse.redirect(new URL("/dashboard", request.url));
}

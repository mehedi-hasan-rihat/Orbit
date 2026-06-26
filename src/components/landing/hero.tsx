"use client";

import { useRouter } from "next/navigation";
import { PixelHero } from "@/components/ui/pixel-perfect-hero";

export function HeroSection() {
  const router = useRouter();

  return (
    <PixelHero
      word1="Track your"
      word2="Career."
      description="Orbit keeps all your job applications organized — from the first wishlist to a signed offer. Stop losing track in spreadsheets."
      primaryCta="Start Tracking Free"
      primaryCtaMobile="Get Started"
      secondaryCta="View on GitHub"
      secondaryCtaMobile="GitHub"
      onPrimaryClick={() => router.push("/register")}
      githubUrl="https://github.com"
    />
  );
}

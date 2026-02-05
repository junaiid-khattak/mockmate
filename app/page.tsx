"use client";

import { useRouter } from "next/navigation";
import LandingPage from "@/components/landing/LandingPage";

export default function Page() {
  const router = useRouter();
  return <LandingPage onPrimaryCta={() => router.push("/signup")} />;
}

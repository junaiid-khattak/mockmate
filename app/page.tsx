"use client";

import { useRouter } from "next/navigation";
import LandingPage from "@/components/landing/LandingPage";
import { StructuredData } from "@/components/StructuredData";

export default function Page() {
  const router = useRouter();
  return (
    <>
      <StructuredData />
      <LandingPage onPrimaryCta={() => router.push("/signup")} />
    </>
  );
}

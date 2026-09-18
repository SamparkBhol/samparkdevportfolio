import Link from "next/link";
import type { Metadata } from "next";
import { ResumeDoc } from "@/components/resume/ResumeDoc";
import { resume } from "@/content/resume";

export const metadata: Metadata = { title: "Résumé", description: `${resume.profile.name}, ${resume.profile.title}. The plain résumé.`, alternates: { canonical: "/resume/" } };

export default function ResumePage() {
  return (
    <main className="resume-page">
      <p className="rd-back"><Link href="/">▶ Play the issue instead</Link></p>
      <ResumeDoc />
    </main>
  );
}

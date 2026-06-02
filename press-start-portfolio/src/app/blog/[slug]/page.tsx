import { notFound } from "next/navigation";
import Link from "next/link";
import { portfolio } from "@/content/portfolio";
import { ArcadeButton } from "@/components/ui/ArcadeButton";

export function generateStaticParams() {
  return portfolio.blogs.map((b) => ({ slug: b.slug }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = portfolio.blogs.find((b) => b.slug === slug);
  if (!post) notFound();
  return (
    <main className="mx-auto max-w-2xl px-5 py-28">
      <Link href="/#blogs" className="font-pixel text-xs text-pop-cyan">◂ BACK</Link>
      <h1 className="font-comic text-4xl text-pop-yellow mt-4 [-webkit-text-stroke:1px_black]">{post.title}</h1>
      <p className="font-pixel text-[10px] mt-2">{post.date} · {post.readingMins} MIN READ</p>
      <p className="font-body mt-6">{post.excerpt}</p>
      <p className="font-body mt-4 text-paper/70 italic">Full post content coming soon — wire to MDX when ready.</p>
      <div className="mt-8"><ArcadeButton href="/#blogs" color="green">▶ MORE ISSUES</ArcadeButton></div>
    </main>
  );
}

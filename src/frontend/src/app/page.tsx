import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Real-Time Collaborative Code Whiteboard</h1>
      <p className="text-neutral-700 mb-6">
        Create and collaborate on code blocks and diagrams in an infinite canvas.
      </p>
      <div className="flex gap-3">
        <Link href="/board/local-mvp" className="btn btn-primary">Open Whiteboard</Link>
        <Link href="/about" className="btn">About</Link>
      </div>
    </div>
  );
}



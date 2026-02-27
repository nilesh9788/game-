import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        <h1 className="text-7xl font-bold">404</h1>
        <h2 className="text-3xl font-bold">Game Not Found</h2>
        <p className="text-neutral-400 text-lg max-w-md">
          The game you're looking for doesn't exist or hasn't been released yet.
        </p>
        <Link href="/">
          <button className="game-button-primary">
            Back to GameHub
          </button>
        </Link>
      </div>
    </main>
  );
}

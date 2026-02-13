
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-900">
      <main className="flex w-full max-w-4xl flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-blue-600">
          Shaxsiy Rejalashtiruvchi
        </h1>
        <p className="mb-8 max-w-lg text-xl text-gray-600">
          Vazifalarni, moliyani va analitikani bir joyda boshqaring.
        </p>

        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white transition hover:bg-blue-700"
          >
            Boshqaruv Paneliga o'tish
          </Link>
          <a
            href="https://t.me/YourBotName" // Replace with actual bot link if available
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-lg font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Telegram Botni ochish
          </a>
        </div>
      </main>

      <footer className="absolute bottom-4 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Personal Planner. All rights reserved.
      </footer>
    </div>
  );
}

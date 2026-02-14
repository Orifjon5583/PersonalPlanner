import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900">
      <main className="flex w-full max-w-4xl flex-col items-center justify-center px-4 text-center">
        {/* Logo */}
        <div className="mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <span className="text-3xl font-bold text-white">P</span>
        </div>

        <h1 className="mb-4 text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Shaxsiy Rejalashtiruvchi
        </h1>
        <p className="mb-8 max-w-lg text-xl text-gray-600">
          Vazifalarni, moliyani va analitikani bir joyda boshqaring.
        </p>

        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg shadow-md"
          >
            Kirish
          </Link>
          <a
            href="https://t.me/YourBotName"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-lg font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md"
          >
            Telegram Bot
          </a>
        </div>
      </main>

      <footer className="absolute bottom-4 text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Personal Planner
      </footer>
    </div>
  );
}

"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center font-sans">
                    <h2 className="mb-4 text-3xl font-bold text-red-600">Critical System Error</h2>
                    <p className="mb-6 max-w-md text-gray-800">
                        {error.message || "A critical error preventing the app from loading."}
                    </p>
                    <button
                        onClick={() => reset()}
                        className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 font-bold"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}

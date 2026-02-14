"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <h2 className="mb-4 text-2xl font-bold text-red-600">Something went wrong!</h2>
            <p className="mb-6 max-w-md text-gray-600">
                {error.message || "An unexpected error occurred while loading the dashboard."}
            </p>
            <button
                onClick={() => reset()}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 font-medium"
            >
                Try again
            </button>
        </div>
    );
}

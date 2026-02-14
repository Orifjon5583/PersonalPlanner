export default function Loading() {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                <p className="text-gray-500 font-medium">Yuklanmoqda...</p>
            </div>
        </div>
    );
}

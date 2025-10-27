export default function Loading() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg mx-auto" />
        <p className="mt-4 text-sm text-gray-600">Loading registration...</p>
      </div>
    </div>
  );
}

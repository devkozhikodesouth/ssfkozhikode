// app/error.tsx
"use client";
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <h2 className="text-2xl text-red-600 font-bold">Something went wrong!</h2>
          <p className="text-sm text-gray-600 mb-6">{error.message}</p>
          <button onClick={() => reset()} className="btn bg-green-600 text-white hover:bg-green-700">
            Try again
          </button>
        </div>  
      </body>
    </html>
  );
}

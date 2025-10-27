"use client";
import React from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  // Keep UI simple and consistent with Tailwind/DaisyUI used in the project
  return (
    <html>
      <body className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="max-w-lg bg-base-100 shadow-lg rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-sm text-gray-600 mb-6">An unexpected error occurred while rendering this page.</p>
          <details className="text-xs text-left bg-gray-50 p-4 rounded mb-6">
            <summary className="cursor-pointer font-medium">Technical details (expand)</summary>
            <pre className="whitespace-pre-wrap mt-2 text-xs">{String(error?.message || error)}</pre>
          </details>

          <div className="flex gap-4 justify-center">
            <button
              className="btn bg-green-600 text-white hover:bg-green-700"
              onClick={() => reset()}
            >
              Retry
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => window.location.replace("/")}
            >
              Go to home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

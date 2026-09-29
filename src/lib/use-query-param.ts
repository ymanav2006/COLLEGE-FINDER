"use client";

import { useEffect, useState } from "react";

/**
 * Reads a URL search param once, after mount.
 *
 * Deliberately avoids `useSearchParams()` so these routes can be statically
 * prerendered with their real content in the HTML instead of streaming a
 * Suspense shell that only fills in after hydration.
 *
 * Returns `null` during SSR and on the first client render, then the actual
 * value (or `null` when the param is absent).
 */
export function useQueryParam(key: string): string | null {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    setValue(new URLSearchParams(window.location.search).get(key));
  }, [key]);

  return value;
}

"use client";

import { useEffect, useState } from "react";

/**
 * Reads the current URL's query string on the client, after mount.
 *
 * Unlike next/navigation's `useSearchParams()`, this does NOT force a CSR
 * bailout, so the component using it can be fully server-rendered (important for
 * SEO and non-JS crawlers). Returns `null` during SSR and the first client
 * render, then a `URLSearchParams` once mounted. Consumers read URL params
 * inside effects only, so `null` simply means "not applied yet".
 */
export function useUrlParams(): URLSearchParams | null {
  const [params, setParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
  }, []);

  return params;
}

"use client";

import { useSyncExternalStore } from "react";

/**
 * Reads the current URL's query string on the client, after mount.
 *
 * Unlike next/navigation's `useSearchParams()`, this does NOT force a CSR
 * bailout, so the component using it can be fully server-rendered (important for
 * SEO and non-JS crawlers). Returns `null` during SSR and the hydration render,
 * then a `URLSearchParams` once mounted. Consumers read URL params inside
 * effects only, so `null` simply means "not applied yet".
 *
 * Modelled as an external store rather than `setState` inside an effect: the
 * location IS an external system, and this way React never schedules a
 * cascading render pass just to publish a value it could have read directly.
 */

// useSyncExternalStore requires a stable snapshot: returning a fresh
// URLSearchParams on every call would loop forever. Cache per search string.
let cachedSearch: string | null = null;
let cachedParams: URLSearchParams | null = null;

function getSnapshot(): URLSearchParams {
  const search = window.location.search;
  if (cachedParams === null || cachedSearch !== search) {
    cachedSearch = search;
    cachedParams = new URLSearchParams(search);
  }
  return cachedParams;
}

/** No server snapshot exists — the URL is only known on the client. */
function getServerSnapshot(): URLSearchParams | null {
  return null;
}

/** The location never changes under us without a navigation, so nothing to subscribe to. */
function subscribe(): () => void {
  return () => {};
}

export function useUrlParams(): URLSearchParams | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

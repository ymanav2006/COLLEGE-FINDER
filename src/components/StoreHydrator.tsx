"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

/**
 * Rehydrates the persisted store on the client only, so server and client
 * markup match on first paint and no localStorage access happens during SSR.
 */
export default function StoreHydrator() {
  useEffect(() => {
    useAppStore.persist.rehydrate();
  }, []);
  return null;
}

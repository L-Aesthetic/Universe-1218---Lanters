import type { PersistedState } from "./types";
import { STORAGE_KEY } from "./data";

export function loadPersistedState(): Partial<PersistedState> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PersistedState>;
  } catch {
    return null;
  }
}

export function savePersistedState(state: PersistedState) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearPersistedState() {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

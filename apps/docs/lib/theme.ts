// Shared (framework-agnostic) constant used by both the server layout's
// anti-FOUC inline script and the client ThemeToggle. Kept out of the
// "use client" ThemeToggle module so the server can read its literal value.
export const STORAGE_KEY = "superbase-theme";

import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Get the current session from the request headers
 */
export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized: Please sign in to continue");
  }
  return session;
}

/**
 * Require admin role - throws error if not admin
 */
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  return session;
}

/**
 * Check if current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.user.role === "admin";
}

import { useMemo } from "react";
import { useMatches } from "react-router";

import type { Ad } from "~/models/ad.server";
import type { User } from "~/models/user.server";

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function safeRedirect(redirectTo: unknown, fallback: string): string {
  return redirectTo && typeof redirectTo == "string" && !redirectTo.includes("//") ? redirectTo : fallback;
}

export const formatCloudUrl = (ad: Ad): string => {
  const parts = ad.imgUrl.split('upload/');
  if (parts.length != 2) { return ad.imgUrl; }
  let crop = 'c_fit,f_auto';
  switch (ad.size) {
    case 1:
      crop += ',w_250,h_250';
      break;
    case 2:
      crop += (ad.orient == 'l' ? ',w_400' : ',h_380');
      break;
    case 3:
      crop += (ad.orient == 'l' ? ',w_800' : ',h_760');
      break;
    default:
      break;
  }
  return `${parts[0]}upload/${crop}/${parts[1]}`
}

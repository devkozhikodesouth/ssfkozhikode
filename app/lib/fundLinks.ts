/*
 * SERVER-ONLY: secret public link keys for the Fund Challenge pages.
 * Never import this from a "use client" file — that would ship both keys
 * to every browser. Changing a key here changes that group's link.
 */
import { FundGroup } from "@/app/utils/fund";

const FUND_LINK_KEYS: Record<FundGroup, string> = {
  executive: "TZhOadxEiKip4fBxrYbdjQ",
  council: "3O31fjD29wOGimfJ1N2rcA",
};

export const publicPath = (key: string) => `/fundchallenge/${key}`;

/* Group for a public link key, or null when the key is unknown */
export function resolveFundKey(key: unknown): FundGroup | null {
  if (typeof key !== "string") return null;
  const match = (Object.keys(FUND_LINK_KEYS) as FundGroup[]).find((g) => FUND_LINK_KEYS[g] === key);
  return match ?? null;
}

/* Admin: public path for a group's link */
export const fundLinkPath = (group: FundGroup) => publicPath(FUND_LINK_KEYS[group]);

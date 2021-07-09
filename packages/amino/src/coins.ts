import { Uint53, Uint64 } from "@cosmjs/math";

export interface Coin {
  readonly denom: string;
  readonly amount: string;
}

/**
 * Creates a coin.
 */
export function coin(amount: number, denom: string): Coin {
  return { amount: new Uint53(amount).toString(), denom: denom };
}

/**
 * Creates a list of coins with one element.
 */
export function coins(amount: number, denom: string): Coin[] {
  return [coin(amount, denom)];
}

/**
 * Takes a coins list like "819966000ucosm,700000000ustake" and parses it.
 */
export function parseCoins(input: string): Coin[] {
  return input
    .replace(/\s/g, "")
    .split(",")
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^([0-9]+)([a-zA-Z][a-zA-Z0-9/-]{2,127})$/);
      if (!match) throw new Error("Got an invalid coin string");
      return {
        amount: Uint64.fromString(match[1]).toString(),
        denom: match[2],
      };
    });
}

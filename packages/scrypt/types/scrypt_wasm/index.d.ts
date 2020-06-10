/**
 * @param {string} password
 * @param {string} salt
 * @param {number} n
 * @param {number} r
 * @param {number} p
 * @param {number} dklen
 * @returns {string}
 */
export function scrypt(
  password: string,
  salt: string,
  n: number,
  r: number,
  p: number,
  dklen: number,
): string;
export default init;
declare function init(input: any): Promise<any>;

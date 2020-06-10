export interface ScryptParams {
  readonly dkLen: number;
  readonly n: number;
  readonly r: number;
  readonly p: number;
}
declare type ScryptImplementation = "js" | "wasm";
export declare class Scrypt {
  static make(implementation?: ScryptImplementation): Promise<Scrypt>;
  private readonly impl;
  private constructor();
  run(password: Uint8Array, salt: Uint8Array, params: ScryptParams): Promise<Uint8Array>;
}
export {};

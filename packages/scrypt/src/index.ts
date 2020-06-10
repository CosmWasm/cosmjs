import { Encoding } from "@iov/encoding";
import * as scryptJs from "scrypt-js";

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore: 7016
import * as scryptWasm from "./scrypt_wasm";

const { toHex, fromHex, fromBase64 } = Encoding;

export interface ScryptParams {
  readonly dkLen: number;
  readonly n: number;
  readonly r: number;
  readonly p: number;
}

// Global symbols in some environments
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/WebAssembly
// https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
declare const WebAssembly: any | undefined;
declare const fetch: any | undefined;

type ScryptImplementation = "js" | "wasm";

export class Scrypt {
  public static async make(implementation?: ScryptImplementation): Promise<Scrypt> {
    const impl = implementation || "wasm";

    switch (impl) {
      case "js": {
        return new Scrypt(impl);
      }
      case "wasm": {
        // Using a dynamic import allows Webpack to move this into a separate chunk in many configurations
        const wasmBlob = (await import("./scrypt_wasm/wasm.json")).default;
        const wasmBytes = fromBase64(wasmBlob);
        await scryptWasm.default(wasmBytes);
        return new Scrypt(impl);
      }
      default:
        throw new Error("Unexpected implementation value");
    }
  }

  private readonly impl: ScryptImplementation;

  private constructor(impl: ScryptImplementation) {
    this.impl = impl;
  }

  public async run(password: Uint8Array, salt: Uint8Array, params: ScryptParams): Promise<Uint8Array> {
    switch (this.impl) {
      case "js": {
        return scryptJs.scrypt(password, salt, params.n, params.r, params.p, params.dkLen);
      }
      case "wasm": {
        return fromHex(
          scryptWasm.scrypt(toHex(password), toHex(salt), params.n, params.r, params.p, params.dkLen),
        );
      }
      default:
        throw new Error("Unexpected implementation value");
    }
  }
}

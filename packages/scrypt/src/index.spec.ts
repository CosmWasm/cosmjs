import { Encoding } from "@iov/encoding";

import { Scrypt, ScryptParams } from "./index";

const { fromHex, toAscii } = Encoding;

for (const impl of ["js", "wasm"] as const) {
  describe(`scrypt (${impl})`, () => {
    it("works for keplr params", async () => {
      const scrypt = await Scrypt.make(impl);
      const keplrParams: ScryptParams = {
        dkLen: 32,
        n: 131072,
        r: 8,
        p: 1,
      };

      const runs = 1; // increase for benchmarking
      for (let i = 0; i < runs; i++) {
        const salt = fromHex("00aa00aa00aa00aa00aa00aa00aa00aa00aa00aa00aa00aa00aa00aa00aa00aa");
        const password = toAscii(`Hello, world (${i})`);
        const result = await scrypt.run(password, salt, keplrParams);
        expect(result).toBeTruthy();
      }
    }, 60_000);

    it("conforms to test vectors from RFC 7914", async () => {
      const scrypt = await Scrypt.make(impl);
      {
        const p = toAscii("");
        const s = toAscii("");
        const params: ScryptParams = { n: 16, r: 1, p: 1, dkLen: 64 };
        const expected = fromHex(
          "77d6576238657b203b19ca42c18a0497f16b4844e3074ae8dfdffa3fede21442fcd0069ded0948f8326a753a0fc81f17e8d3e0fb2e0d3628cf35e20c38d18906",
        );
        expect(await scrypt.run(p, s, params)).toEqual(expected);
      }
      {
        const p = toAscii("password");
        const s = toAscii("NaCl");
        const params: ScryptParams = { n: 1024, r: 8, p: 16, dkLen: 64 };
        const expected = fromHex(
          "fdbabe1c9d3472007856e7190d01e9fe7c6ad7cbc8237830e77376634b3731622eaf30d92e22a3886ff109279d9830dac727afb94a83ee6d8360cbdfa2cc0640",
        );
        expect(await scrypt.run(p, s, params)).toEqual(expected);
      }
      {
        const p = toAscii("pleaseletmein");
        const s = toAscii("SodiumChloride");
        const params: ScryptParams = { n: 16384, r: 8, p: 1, dkLen: 64 };
        const expected = fromHex(
          "7023bdcb3afd7348461c06cd81fd38ebfda8fbba904f8e3ea9b543f6545da1f2d5432955613f0fcf62d49705242a9af9e61e85dc0d651e40dfcf017b45575887",
        );
        expect(await scrypt.run(p, s, params)).toEqual(expected);
      }
      {
        const p = toAscii("pleaseletmein");
        const s = toAscii("SodiumChloride");
        const params: ScryptParams = { n: 1048576, r: 8, p: 1, dkLen: 64 };
        const expected = fromHex(
          "2101cb9b6a511aaeaddbbe09cf70f881ec568d574a2ffd4dabe5ee9820adaa478e56fd8f4ba5d09ffa1c6d927c40f4c337304049e8a952fbcbf45c6fa77a41a4",
        );
        expect(await scrypt.run(p, s, params)).toEqual(expected);
      }
    }, 60_000);
  });
}

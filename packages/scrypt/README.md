# @cosmwasm/scrypt

## Update guide

This packages includes a build of https://github.com/MyEtherWallet/scrypt-wasm/pull/2.
Check out this repo and look into `Makefile` for how to install `wasm-pack`.

1. Run `wasm-pack build --target web`
2. Copy the output of `base64 pkg/scrypt_wasm_bg.wasm` into `src/scrypt_wasm/wasm.json`
3. Copy `pkg/scrypt_wasm.js` into `src/scrypt_wasm/index.js`
4. In `src/scrypt_wasm/index.js` replace `input = import.meta.url.replace(/\.js$/, "_bg.wasm");` with `throw new Error("input undefined");`
   and add the following block at the top of the file:

```js
// For Node.js 10 support
if (typeof TextEncoder === "undefined" && global) {
  global.TextEncoder = require("util").TextEncoder;
}
if (typeof TextDecoder === "undefined" && global) {
  global.TextDecoder = require("util").TextDecoder;
}
```

## License

This package is part of the cosmwasm-js repository, licensed under the Apache
License 2.0 (see
[NOTICE](https://github.com/confio/cosmwasm-js/blob/master/NOTICE) and
[LICENSE](https://github.com/confio/cosmwasm-js/blob/master/LICENSE)).

# Using the Mask

This assumes you have already run through the sample in the [README](./README.md).
And have an initialized account. You can use any connect method (sharing with cli,
customize blockchain) if you want. We will show uploading mask and using it
on the Demo Net.

Start with `./bin/cosmwasm-cli --init examples/helpers.ts examples/mask.ts`
(note the addition of `examples/mask.ts`)

## Setup

Ensure the account is set up:

```ts
// you can hand-copy a mnemonic here, but this is easiest for reuse between sessions
// it creates a random one first time, then reads it in the future
const mnemonic = loadOrCreateMnemonic("foo.key");
const {address, client} = await connect(mnemonic, {});
address
client.getAccount();
```

We will use [mask v0.1.0](https://github.com/CosmWasm/cosmwasm-examples/tree/mask-0.1.0/mask),
the hash is [defined here](https://github.com/CosmWasm/cosmwasm-examples/blob/mask-0.1.0/mask/hash.txt):
`1f50bbff503fd9c7bfe713bbf42b309cf88ef299fa76e0242051c9a7e25649a3`. The following will check if
it is already uploaded:

```ts
const hash = "1f50bbff503fd9c7bfe713bbf42b309cf88ef299fa76e0242051c9a7e25649a3"
client.getCodes().then(codes => codes.filter(x => x.checksum === hash))
```

If it is not uploaded, we will upload it:

```ts
// Either download the code
const wasmUrl = "https://github.com/CosmWasm/cosmwasm-examples/blob/mask-0.1.0/mask/contract.wasm?raw=true";
const wasm = await downloadWasm(wasmUrl);

// Or load from local file
const wasmFile = ".../cosmwasm-examples/mask/contract.wasm"
const wasm = fs.readFileSync(wasmFile);

// Then upload it
const uploadResult = await client.upload(wasm, { source: "https://crates.io/api/v1/crates/cw-mask/0.1.0/download", builder: "confio/cosmwasm-opt:0.7.3"});
uploadResult
uploadResult.logs[0].events[0]
```

Now, make an instance (as above):

```ts
// instantiate one contract
const codeId = uploadResult.codeId;
const maskResp = await client.instantiate(codeId, {}, "My Mask");
const mask = maskResp.contractAddress;

// You can also find the contractAddress later (in a future session), like:
const contracts = await client.getContracts(codeId);
const mask = contracts.filter(x => x.label == "My Mask").map(x => x.address)[0];
```

Now, let's use the mask. To do so, we need to load it up with some tokens
(both native and ERC20 - from the contract you deployed last time).

```ts
client.sendTokens(mask, [{amount: "500000", "denom": "ucosm"}])
client.getAccount(mask)

// get the foo contract again...
const ercId = 1; // from earlier example, change this if different on your network
const ercs = await client.getContracts(ercId);
const foo = ercs.filter(x => x.label == "FOO").map(x => x.address)[0];

// send some erc tokens to the mask as before
smartQuery(client, foo, { balance: { address: mask } })
const ercMsg = { transfer: {recipient: mask, amount: "800000"}}
client.execute(foo, ercMsg);
smartQuery(client, foo, { balance: { address: mask } })
```

## Usage

### Sending Native Tokens

Now, let's send some tokens from it:

```ts
const rand = await randomAddress("cosmos");
client.getAccount(rand)
client.getAccount(mask)

const callSend: HandleMsg = { reflectmsg: { msgs: [sendMsg(mask, rand, [{amount: "80000", denom: "ucosm"}])]}};
client.execute(mask, callSend)
client.getAccount(rand)
client.getAccount(mask)
```

### Sending "ERC20" Tokens

And call the ERC20 contract from it:

```ts
smartQuery(client, foo, { balance: { address: rand } })
smartQuery(client, foo, { balance: { address: mask } })

const callContract: HandleMsg = { reflectmsg: { msgs: [contractMsg(foo, {transfer: {"amount": "80000", "recipient": rand}})]}};
client.execute(mask, callContract)
smartQuery(client, foo, { balance: { address: rand } })
smartQuery(client, foo, { balance: { address: mask } })
```

### Staking via OpaqueMsg

And now... let's use `OpaqueMsg` to call into native blockchain messages.
Here we will trigger a staking command. This is an "opaque" command, so neither cosmwams-js
nor the cosmwasm contract understands it. It is passed verbatim from the client to
the wasmd blockchain (reflected by mask, so using the mask address).

To view this properly, we will have to use the cli tooling:

```sh
wasmcli config node https://rpc.demo-071.cosmwasm.com:443
wasmcli config trust-node true

wasmcli query staking validators
wasmcli query staking delegations-to cosmosvaloper1e8gslcu2u2p5zp9rgj8alz4q3lt6hvywqppf23

# create a demo tx to show how it looks
wasmcli tx staking delegate cosmosvaloper1e8gslcu2u2p5zp9rgj8alz4q3lt6hvywqppf23 300000ustake --generate-only --chain-id testing
```

To create such a message, we need to produce the amino json encoding of a staking message.
That does involve a bit of investigation, but looks like:

```json
{
  "type": "cosmos-sdk/MsgDelegate",
  "value": {
    "delegator_address": "",
    "validator_address": "cosmosvaloper1e8gslcu2u2p5zp9rgj8alz4q3lt6hvywqppf23",
    "amount": {
      "denom": "ustake",
      "amount": "300000"
    }
  }
}
```

Run the following (taking the operator address for the validator from the cli output)

```ts
mask
address

// get some staking tokens for the mask
hitFaucet(defaultFaucetUrl, mask, "STAKE")
client.getAccount(mask)

.editor
const staking2 = {
  type: "cosmos-sdk/MsgDelegate",
  value: {
    delegator_address: mask,
    validator_address: "cosmosvaloper1e8gslcu2u2p5zp9rgj8alz4q3lt6hvywqppf23",
    amount: {
      denom: "ustake",
      amount: "300000"
    }
  }
};
^D

const callOpaque2: HandleMsg = { reflectmsg: { msgs: [opaqueMsg(staking2)]}};
client.execute(mask, callOpaque2)

// Note: currently this returns an error about "Event type must be one of message, transfer, wasm; got delegate"
// That is on the client parsing the logs on success. Don't worry, it will be fixed soon.
// https://github.com/CosmWasm/cosmwasm-js/issues/157
```

Now validate this with the CLI tooling:

```sh
wasmcli query staking delegations-to cosmosvaloper1e8gslcu2u2p5zp9rgj8alz4q3lt6hvywqppf23

// use the address from node repl
wasmcli query staking delegations <mask address>
```

The opaqueMsg style is a bit more tricky as it places the burden of transaction construction upon the
user (you). However, it does allow you to call into any native module in the blockchain.
We plan to add custom types for some popular native messages to make this binding simpler,
and also allow these to be triggered by internal contract logic (they cannot form opaque messages,
but rather just relay opaque messages formed by the clients).

## Transfering Owner

Happy hacking using the mask contract. And to make this a bit more interesting, note that you can transfer
control of this mask. By transfering ownership, we transfer control of our `ucosm` native , our `FOO` erc20 token,
and our open staking position in one fell swoop, without the other modules/contracts being aware of the change.

```ts
const aliceMnem = loadOrCreateMnemonic("other.key");
const {address: alice, client: aliceClient} = await connect(aliceMnem, {});
alice

client.getAccount()
aliceClient.getAccount()

// send some minimal tokens
client.sendTokens(alice, [{amount: "500000", "denom": "ucosm"}])
aliceClient.getAccount()

// now, transfer ownership of the mask
const query: QueryMsg = { owner: {} };
smartQuery(client, mask, query);
const transferMsg: HandleMsg = { changeowner: { owner: alice }}
client.execute(mask, transferMsg)
smartQuery(client, mask, query);
```

From now own, alice can control the mask, not me.... And she can extract the erc20 tokens or anything else the mask controls

```ts
smartQuery(client, foo, { balance: { address: alice } })

const withdraw: HandleMsg = { reflectmsg: { msgs: [contractMsg(foo, {transfer: {"amount": "80000", "recipient": alice}})]}};
// this will error (me)
client.execute(mask, withdraw)
// this will succeed (alice)
aliceClient.execute(mask, withdraw)
smartQuery(client, foo, { balance: { address: alice } })
```

Please explore the use-cases of the Mask. More than a production-ready contract (which it may be),
it is designed to be a tool for devs to explore the potential of composition and re-dispatching messages.
See what you can do here, then use this knowledge to build your own contract that calls other contracts.
This is working today, you just have to return the right messages from `handle`.

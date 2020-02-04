import * as types from "../types";
import * as data from "./data";
export declare function encodeAminoTx(tx: types.AminoTx): data.AminoTx;
export declare function encodeStdTx(tx: types.StdTx): data.StdTx;
export declare function encodeFee(fee: types.StdFee): data.StdFee;
export declare function encodeMsg(msg: types.Msg): data.Msg;
export declare function encodeMsgSend(msg: types.MsgSend): data.MsgSend;
export declare function encodeSignature(sig: types.StdSignature): data.StdSignature;
export declare function encodePubKey(pub: types.PubKey): data.PubKey;

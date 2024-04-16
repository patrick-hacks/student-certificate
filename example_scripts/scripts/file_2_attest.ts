import { SignProtocolClient, SpMode } from "@ethsign/sp-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { config } from "../config";
import bs58 from "bs58";

const toHexString = (byteArray: Uint8Array) => {
  return Array.prototype.map
    .call(byteArray, function (byte) {
      return ("0" + (byte & 0xff).toString(16)).slice(-2);
    })
    .join("");
};
export const getBytes32FromIpfsHash = (ipfsListing: string) => {
  return "0x" + toHexString(bs58.decode(ipfsListing).slice(2));
};
export const getIpfsHashFromBytes32 = (bytes32Hex: string) => {
  const hashHex = "1220" + bytes32Hex.slice(2);
  const hashBytes = Buffer.from(hashHex, "hex");
  const hashStr = bs58.encode(hashBytes);
  return hashStr;
};
export const getIpfsHashFromUint256 = (uint: BigInt) => {
  const bigint: BigInt = uint
  return getIpfsHashFromBytes32('0x' + bigint.toString(16))
}

const client = new SignProtocolClient(SpMode.OnChain, {
  chain: config.chain,
  account: privateKeyToAccount(config.privateKey),
});

const schemaId = config.cidFilesSchema.split('_').slice(-1)[0];

async function createCidAttestation(name: string, cid: string) {
  const res = await client.createAttestation({
    schemaId: schemaId,
    data: { name: name, cid: getBytes32FromIpfsHash(cid) },
    indexingValue: cid,
    recipients: ['0xc01A78dbf0b7fEbf6910784c4eB985Dcf67c1E5E']
  });

  console.log(res)
  return res
}

async function getAttestationCid(attestationId: string) {
  const res = await client.getAttestation(
    attestationId
  );
  const data = res.data
  if (typeof data === "object" && data !== null) {
    data['cid'] = getIpfsHashFromUint256(data['cid'])
  }
  res.data = data
  console.log(res)
  return res
}

var name = 'test_file';
var cid = 'QmWC9AkGa6vSbR4yizoJrFMfmZh4XjZXxvRDknk2LdJffc';

createCidAttestation(name, cid).then(response => {
  console.log('validating existance of attestation')
  getAttestationCid(response.attestationId)
})

// getAttestationCid('0x43')
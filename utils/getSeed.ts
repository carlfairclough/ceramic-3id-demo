import { ethereum } from "@ceramicnetwork/blockchain-utils-linking";
import { EthereumProvider } from "@3id/connect";
import { AccountId } from "caip";

export async function getSeed(address: `0x${string}`, provider: EthereumProvider): Promise<string> {
  const account = new AccountId({
    address: address,
    chainId: "eip155:1",
  });

  const message = "Allow this account to control your identity";
  const authSecret = await ethereum.authenticate(message, account, provider);
  const entropy2 = authSecret.slice(2)
  // const entropy = hash(fromString(authSecret.slice(2)));
  return entropy2;
}
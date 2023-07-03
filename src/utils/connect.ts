
import { fromHex } from "@3id/common";
import {ThreeIdProvider} from "@3id/did-provider";
import { CeramicClient } from '@ceramicnetwork/http-client'
import { DID } from "dids";

import { getResolver as get3IDResolver } from "@ceramicnetwork/3id-did-resolver";

export const connect3ID = async (seed: string) => {

  
  // First clear all local permissions so accounts can switch
  Object.keys(localStorage)
    .filter((x) => x.startsWith("3id_permission_"))
    .forEach((x) => localStorage.removeItem(x));

  const _seed = fromHex(seed);
  const ceramic = new CeramicClient(process.env.NEXT_PUBLIC_CERAMIC_ENDPOINT)

  const threeID = await ThreeIdProvider.create({
    ceramic: ceramic,
    seed: _seed,
    getPermission: (request: any) => Promise.resolve(request.payload.paths),
  });

  const resolver = get3IDResolver(ceramic);

  const did = new DID({
    //@ts-ignore
    provider: threeID.getDidProvider(),
    resolver: resolver,
  });

 let authenticated = false

  try {
    await did.authenticate();
    authenticated = true
  } catch (err) {
    console.error(`Failed to authenticate ${did.id}`, err);
  }

  ceramic.setDID(did);

  return {
    // didProvider: did,
    did: did.id,
    authenticated,
    seed: seed,
    uint8seed: _seed,
  };
};

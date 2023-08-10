import { hash } from "@stablelib/sha256";
import { fromString } from "uint8arrays";
import { ThreeIdProvider } from "@3id/did-provider";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { DID } from "dids";
import { getResolver } from "@ceramicnetwork/3id-did-resolver";

export const connect3ID = async (seed: string, authId: string) => {
  // First clear all local permissions so accounts can switch
  Object.keys(localStorage)
    .filter((x) => x.startsWith("3id_permission_"))
    .forEach((x) => localStorage.removeItem(x));

  const ceramic = new CeramicClient('https://ceramic.disco.xyz')
  console.log(ceramic)

  const _seed = hash(fromString(seed));


  const opts = {
      authId: authId,
      authSecret: _seed,
    };

  try {
    const getPermission = (request: any) => Promise.resolve(request.payload.paths)

    const threeIdConfig = {
      authId: authId,
      authSecret: _seed,
      getPermission,
      ceramic: ceramic
    }
    console.log(threeIdConfig)
    //@ts-ignore
    const threeId = await ThreeIdProvider.create(threeIdConfig)
    console.log('done', await threeId)
    console.log('done')

    const provider = await threeId.getDidProvider()
    // This is exactly how ceramic have implemented it,
    // using v2.0.0 of @ceramicnetwork/3id-did-resolver and
    // v2.0.0 of @ceramicnetwork/http-client
    // @ts-ignore
    const resolver = getResolver(ceramic)

    const did = new DID({
      provider: provider,
      resolver: resolver,
    });

    let authenticated = false;

    try {
      await did.authenticate();
      authenticated = true;
    } catch (err) {
      console.error(`Failed to authenticate ${did.id}`, err);
    }

    ceramic.setDID(did);
    // return {done: 'done'}
    return {
      did: did.id,
      seedString: seed,
      ...opts,
    };
  } catch (err) {
    console.error(err);
    return {
      error: "Failed to create DID",
      did: "Failed",
      seedString: seed,
      ...opts,
    };
  }
};

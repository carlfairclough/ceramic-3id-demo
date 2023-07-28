import { hash } from "@stablelib/sha256";
import { fromString } from "uint8arrays";
import ThreeIdProvider from "3id-did-provider";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { DID } from "dids";
import { getResolver } from "@ceramicnetwork/3id-did-resolver";

export const connect3ID = async (seed: string, authId?: string) => {
  // First clear all local permissions so accounts can switch
  Object.keys(localStorage)
    .filter((x) => x.startsWith("3id_permission_"))
    .forEach((x) => localStorage.removeItem(x));

  const ceramic = new CeramicClient(process.env.NEXT_PUBLIC_CERAMIC_ENDPOINT);

  const _seed = hash(fromString(seed));

  let opts;
  if (authId) {
    opts = {
      authId: authId,
      authSecret: _seed,
    };
  } else {
    opts = {
      seed: _seed,
    };
  }

  try {
    const threeID = await ThreeIdProvider.create({
      ...opts,
      //@ts-ignore // expects CeramicApi. Why?
      ceramic: ceramic,
      getPermission: (request: any) => Promise.resolve(request.payload.paths),
    });

    const resolver = getResolver(ceramic);

    const did = new DID({
      //@ts-ignore // DidProvider is not assignable to type DIDProvider. Why?
      provider: threeID.getDidProvider(),
      //@ts-ignore // Mismatched types. Expects ResolverRegistry. Why?
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

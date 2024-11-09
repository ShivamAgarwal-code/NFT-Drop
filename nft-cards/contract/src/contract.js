import '@agoric/zoe/exported';

import { makeIssuerKit, AssetKind, AmountMath } from '@agoric/ertp';
import { Far } from '@agoric/marshal';
import { E } from '@agoric/eventual-send';

const start = (zcf) => {
  const { issuer, mint, brand } = makeIssuerKit('nft cards', AssetKind.SET);

  const zoeService = zcf.getZoeService();

  const sellCards = async (
    newCardNames,
    moneyIssuer,
    sellItemsInstallation,
    pricePerCard,
  ) => {
    const newCardsForSaleAmount = AmountMath.make(newCardNames, brand);
    const allCardsForSalePayment = mint.mintPayment(newCardsForSaleAmount);
    const proposal = harden({
      give: { Items: newCardsForSaleAmount },
    });
    const paymentKeywordRecord = harden({ Items: allCardsForSalePayment });

    const issuerKeywordRecord = harden({
      Items: issuer,
      Money: moneyIssuer,
    });

    const sellItemsTerms = harden({
      pricePerItem: pricePerCard,
    });
    const { creatorInvitation, creatorFacet, instance, publicFacet } = await E(
      zoeService,
    ).startInstance(sellItemsInstallation, issuerKeywordRecord, sellItemsTerms);
    const sellItemsCreatorSeat = await E(zoeService).offer(
      creatorInvitation,
      proposal,
      paymentKeywordRecord,
    );
    return harden({
      sellItemsCreatorSeat,
      sellItemsInstance: instance,
      sellItemsCreatorFacet: creatorFacet,
      sellItemsPublicFacet: publicFacet,
    });
  };

  const creatorFacet = Far('Card store creator', {
    sellCards,
    getIssuer: () => issuer,
  });

  return harden({ creatorFacet });
};

harden(start);
export { start };

// @ts-check
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import { resolve as importMetaResolve } from 'import-meta-resolve';

import bundleSource from '@agoric/bundle-source';

import { E } from '@agoric/eventual-send';
import { makeFakeVatAdmin } from '@agoric/zoe/tools/fakeVatAdmin.js';
import { makeZoeKit } from '@agoric/zoe';
import { makeIssuerKit, AmountMath } from '@agoric/ertp';

// @ts-ignore
const contractPath = new URL('../src/contract.js', import.meta.url).pathname;

test('zoe - sell nft cards', async (t) => {
  const { zoeService } = makeZoeKit(makeFakeVatAdmin().admin);
  const feePurse = E(zoeService).makeFeePurse();
  const zoe = E(zoeService).bindDefaultFeePurse(feePurse);

  const bundle = await bundleSource(contractPath);

  const installation = await E(zoe).install(bundle);

  const {
    mint: moolaMint,
    issuer: moolaIssuer,
    brand: moolaBrand,
  } = makeIssuerKit('moola');
  // moola is a fake currency

  // We will also install the sellItems contract from agoric-sdk !! important
  const bundleUrl = await importMetaResolve(
    '@agoric/zoe/src/contracts/sellItems.js',
    // @ts-ignore
    import.meta.url,
  );
  const bundlePath = new URL(bundleUrl).pathname;
  const sellItemsBundle = await bundleSource(bundlePath);
  const sellItemsInstallation = await E(zoe).install(sellItemsBundle);

  const { creatorFacet: nftCardSellerFacet } = await E(zoe).startInstance(
    installation,
  );

  const allCardNames = harden(['Alice', 'Bob']);
  const moneyIssuer = moolaIssuer;
  const pricePerCard = AmountMath.make(moolaBrand, 10n);

  const {
    sellItemsCreatorSeat,
    sellItemsCreatorFacet,
    sellItemsPublicFacet,
    sellItemsInstance,
  } = await E(nftCardSellerFacet).sellCards(
    allCardNames,
    moneyIssuer,
    sellItemsInstallation,
    pricePerCard,
  );

  const bobInvitation = E(sellItemsCreatorFacet).makeBuyerInvitation();

  const cardIssuer = await E(sellItemsPublicFacet).getItemsIssuer();
  const cardBrand = await cardIssuer.getBrand();
  const makeCardMath = (value) => AmountMath.make(value, cardBrand);

  const cardsForSale = await E(sellItemsPublicFacet).getAvailableItems();
  t.deepEqual(cardsForSale, makeCardMath(['Alice', 'Bob']));

  const terms = await E(zoe).getTerms(sellItemsInstance);

  const bobCardAmount = makeCardMath(['Bob']);

  const bobProposal = harden({
    give: { Money: terms.pricePerItem },
    want: { Items: bobCardAmount },
  });

  const bobPaymentKeywordRecord = harden({
    Money: moolaMint.mintPayment(AmountMath.make(moolaBrand, 10n)),
  });

  const seat = await E(zoe).offer(
    bobInvitation,
    bobProposal,
    bobPaymentKeywordRecord,
  );
  const bobCardPayout = seat.getPayout('Items');
  const bobObtained = await E(cardIssuer).getAmountOf(bobCardPayout);

  t.deepEqual(bobObtained, makeCardMath(['Bob']), 'Bob bought an nft card');

  E(sellItemsCreatorSeat).tryExit();

  const moneyPayment = await E(sellItemsCreatorSeat).getPayout('Money');
  const moneyEarned = await E(moolaIssuer).getAmountOf(moneyPayment);
  t.deepEqual(moneyEarned, AmountMath.make(moolaBrand, 10n));

  const cardInventory = await E(sellItemsCreatorSeat).getPayout('Items');
  const inventoryRemaining = await E(cardIssuer).getAmountOf(cardInventory);
  t.deepEqual(inventoryRemaining, makeCardMath(['Alice']));
});

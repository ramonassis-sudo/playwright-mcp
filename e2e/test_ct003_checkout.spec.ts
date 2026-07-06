import { product, order, buyer } from "../config/test-data";
import { authenticatedTest as test, expect } from "../fixtures/test-options";

test.describe("Checkout", () => {
  test.beforeEach(async ({ cartPage }) => {
    await cartPage.removeAllItems();
  });

  test("@e2e @smoke - CT003 - Fluxo completo de compra com usuário autenticado", async ({
    homePage,
    searchResultsPage,
    productPage,
    cartPage,
    personalDataStep,
    shippingStep,
    paymentStep,
  }) => {
    await homePage.goto();
    await homePage.searchFor(product.searchTerm);
    await searchResultsPage.expectProductListedWithPrice(
      product.productLinkName,
      product.authExpectedPrice,
    );

    await searchResultsPage.openProduct(product.productLinkName);
    await productPage.expectLoadedFor(
      product.searchTerm,
      product.authExpectedPrice,
    );
    await productPage.expectLoadedFor(
      product.searchTerm,
      product.authExpectedPrice,
    );

    await productPage.addToCart();

    await cartPage.continuePurchase();
    await personalDataStep.fillAndContinue(buyer);
    await shippingStep.fillAndContinue(buyer);

    await paymentStep.expectLoaded();
    await paymentStep.selectPix();
    await paymentStep.expectOrderTotals(
      product.authExpectedPrice,
      order.expectedFreight,
      order.authExpectedTotalFinal,
    );
  });
});

import { authenticatedTest as test, expect } from "../fixtures/test-options";
import { removeProduct } from "../config/test-data";

test.describe("Carrinho", () => {
  test.beforeEach(async ({ cartPage }) => {
    await cartPage.removeAllItems();
  });

  test("@e2e @smoke - CT004 - Remover produto do carrinho", async ({
    homePage,
    searchResultsPage,
    productPage,
    cartPage,
  }) => {
    await homePage.goto();
    await homePage.searchFor(removeProduct.searchTerm);
    await searchResultsPage.expectProductListedWithPrice(
      removeProduct.productLinkName,
      removeProduct.expectedPrice,
    );

    await searchResultsPage.openProduct(removeProduct.productLinkName);
    await productPage.expectLoadedFor(
      removeProduct.searchTerm,
      removeProduct.expectedPrice,
      removeProduct.urlPattern,
    );
    await productPage.addToCart();

    await expect(cartPage.summary).toContainText(removeProduct.searchTerm);

    await cartPage.removeItemByName(removeProduct.searchTerm);

    await expect(cartPage.summary).not.toContainText(removeProduct.searchTerm);

    // Como cada thread (worker) usa um usuário único e isolado, o carrinho deve estar totalmente vazio agora!
    await expect(cartPage.emptyCartMessage).toBeVisible();
  });
});

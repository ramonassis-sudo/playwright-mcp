import { authenticatedTest as test, expect } from "../fixtures/test-options";

const TARGET_PRODUCT = {
  searchTerm: "Processador de Alimentos 2.1L - Empire Red",
  productLinkName: "Processador de Alimentos 2.1L - Empire Red",
  expectedPrice: "R$ 1.149,00",
  urlPattern: /processador-de-alimentos-2-1l-empire-red/i,
};

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
    await homePage.searchFor(TARGET_PRODUCT.searchTerm);
    await searchResultsPage.expectProductListedWithPrice(
      TARGET_PRODUCT.productLinkName,
      TARGET_PRODUCT.expectedPrice,
    );

    await searchResultsPage.openProduct(TARGET_PRODUCT.productLinkName);
    await productPage.expectLoadedFor(
      TARGET_PRODUCT.searchTerm,
      TARGET_PRODUCT.expectedPrice,
      TARGET_PRODUCT.urlPattern,
    );
    await productPage.addToCart();

    await expect(cartPage.summary).toContainText(TARGET_PRODUCT.searchTerm);

    await cartPage.removeItemByName(TARGET_PRODUCT.searchTerm);

    await expect(cartPage.summary).not.toContainText(TARGET_PRODUCT.searchTerm);

    // Como cada thread (worker) usa um usuário único e isolado, o carrinho deve estar totalmente vazio agora!
    await expect(cartPage.emptyCartMessage).toBeVisible();
  });
});

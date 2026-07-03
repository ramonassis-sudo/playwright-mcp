import { expect, type Locator, type Page } from "@playwright/test";

export class SearchResultsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  productCard(searchTerm: string): Locator {
    return this.page
      .locator("article:not(.vtex-search-2-x-itemList)")
      .filter({ hasText: searchTerm });
  }

  productLink(linkName: string): Locator {
    return this.page.getByRole("link", { name: linkName }).filter({
      has: this.page.locator('article')
    });
  }

  async expectProductListedWithPrice(
    linkName: string,
    expectedPrice: string,
  ): Promise<void> {
    const link = this.productLink(linkName);
    await expect(link).toBeVisible({ timeout: 15000 });
    await expect(link.locator("xpath=ancestor-or-self::a")).toContainText(
      expectedPrice,
    );
  }

  async openProduct(linkName: string): Promise<void> {
    await this.productLink(linkName).click({ noWaitAfter: true });
  }
}

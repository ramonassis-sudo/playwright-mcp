import { expect, type Locator, type Page } from "@playwright/test";

export class PaymentStep {
  readonly page: Page;
  readonly finalizeButton: Locator;
  readonly pixOption: Locator;
  // Substituir por seletor de domínio dedicado quando disponível
  // (ex.: page.getByTestId("order-summary")).
  readonly orderSummary: Locator;

  constructor(page: Page) {
    this.page = page;
    this.finalizeButton = page
      .locator("#payment-data-submit")
      .filter({ visible: true });
    this.pixOption = page.locator('[data-name="Pix"]');
    this.orderSummary = page.locator("body");
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout\/#\/payment/);
    await expect(this.finalizeButton).toBeVisible();
    await expect(this.finalizeButton).toBeEnabled();
  }

  async selectPix(): Promise<void> {
    await expect(this.pixOption).toBeVisible();
    await this.pixOption.click();
  }

  async expectOrderTotals(
    price: string,
    freight: string,
    total: string,
  ): Promise<void> {
    await expect(this.orderSummary).toContainText(price);
    await expect(this.orderSummary).toContainText(freight);
    await expect(this.orderSummary).toContainText(total);
  }
}

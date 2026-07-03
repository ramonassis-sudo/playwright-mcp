import { expect, type Page } from "@playwright/test";
import type { Buyer } from "../../config/test-data";

export class ShippingStep {
  constructor(private readonly page: Page) {}

  private readonly cep = this.page.locator("#ship-postalCode");
  private readonly number = this.page.locator("#ship-number");
  private readonly receiver = this.page.locator("#ship-receiverName");
  private readonly goToPayment = this.page.locator("#btn-go-to-payment");

  async fillAndContinue(buyer: Buyer): Promise<void> {
    // Check if we are already at the payment step (Smart Checkout)
    await Promise.race([
      this.cep.waitFor({ state: "visible", timeout: 15000 }).catch(() => {}),
      this.page.waitForURL(/#\/payment/, { timeout: 15000 }).catch(() => {})
    ]);

    if (this.page.url().includes("#/payment")) {
      console.log("Endereço já preenchido pelo Smart Checkout. Avançando...");
      return;
    }

    await expect(this.cep).toBeVisible();
    await this.cep.fill(buyer.cep);

    await expect(this.number).toBeVisible();
    await this.number.fill(buyer.addressNumber);

    await expect(this.receiver).toBeVisible();
    await this.receiver.fill(buyer.firstName);

    await expect(this.goToPayment).toBeEnabled();
    await this.goToPayment.click();
  }
}

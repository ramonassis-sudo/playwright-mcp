import { expect, type Page } from "@playwright/test";
import type { Buyer } from "../../config/test-data";

export class ShippingStep {
  constructor(private readonly page: Page) {}

  private readonly cep = this.page.locator("#ship-postalCode");
  private readonly number = this.page.locator("#ship-number");
  private readonly receiver = this.page.locator("#ship-receiverName");
  private readonly goToPayment = this.page.locator("#btn-go-to-payment");

  async fillAndContinue(buyer: Buyer): Promise<void> {
    // Garante que o carregador inicial da VTEX sumiu
    await expect(this.page.locator("#ajaxShield")).toBeHidden().catch(() => {});

    // Check if we are already at the payment step (Smart Checkout)
    await Promise.race([
      this.cep.waitFor({ state: "visible" }).catch(() => {}),
      this.page.waitForURL(/#\/payment/).catch(() => {})
    ]);

    if (this.page.url().includes("#/payment")) {
      console.log("Endereço já preenchido pelo Smart Checkout. Avançando...");
      return;
    }

    // Aguarda estabilização
    await this.page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});

    await expect(this.cep).toBeVisible();
    await expect(this.cep).toBeEnabled();

    await expect(async () => {
      const currentCep = await this.cep.inputValue().catch(() => "");
      const cleanInputCep = currentCep.replace(/\D/g, "");
      const cleanBuyerCep = buyer.cep.replace(/\D/g, "");
      if (!cleanInputCep || cleanInputCep !== cleanBuyerCep) {
        await this.cep.focus();
        await this.cep.fill(buyer.cep);
        await this.cep.press("Tab");
      }

      await expect(this.number).toBeVisible();
      await expect(this.number).toBeEnabled();

      const currentNumber = await this.number.inputValue().catch(() => "");
      if (!currentNumber || currentNumber !== buyer.addressNumber) {
        await this.number.focus();
        await this.number.fill(buyer.addressNumber);
        await this.number.press("Tab");
      }

      await expect(this.receiver).toBeVisible();
      await expect(this.receiver).toBeEnabled();

      const currentReceiver = await this.receiver.inputValue().catch(() => "");
      if (!currentReceiver || currentReceiver !== buyer.firstName) {
        await this.receiver.focus();
        await this.receiver.fill(buyer.firstName);
        await this.receiver.press("Tab");
      }

      await expect(this.goToPayment).toBeEnabled();
      
      const cookieButton = this.page.getByRole("button", { name: "Permitir todos" });
      if (await cookieButton.isVisible().catch(() => false)) {
        await cookieButton.click({ force: true }).catch(() => {});
      }

      await this.goToPayment.click({ force: true });
      await expect(this.page).toHaveURL(/#\/payment/);
    }).toPass({ timeout: 45000 });
  }
}

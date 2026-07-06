import { expect, type Page } from "@playwright/test";
import type { Buyer } from "../../config/test-data";

export class PersonalDataStep {
  constructor(private readonly page: Page) {}

  // Localizadores de alta fidelidade seguindo estritamente a hierarquia do sdet-automator.prompt.md
  private readonly firstName = this.page.getByRole("textbox", { name: "Primeiro nome" });
  private readonly lastName = this.page.getByRole("textbox", { name: "Último nome" });
  private readonly cpf = this.page.getByRole("textbox", { name: "CPF" });
  private readonly phone = this.page.getByRole("textbox", { name: "Telefone" });
  // O botão de avançar na VTEX perde o bind acessível no SPA, usamos o ID ultra-estável
  private readonly goToShipping = this.page.locator("#go-to-shipping");

  async fillAndContinue(buyer: Buyer): Promise<void> {
    // Garante que o carregador inicial da VTEX sumiu e a página está estável antes de interagir
    await expect(this.page.locator("#ajaxShield")).toBeHidden().catch(() => {});

    // Aguarda de forma concorrente até que a etapa de dados pessoais seja exibida
    // OU a etapa de entrega/pagamento seja exibida diretamente (caso a VTEX pule dados pessoais)!
    await Promise.race([
      this.firstName.waitFor({ state: "visible" }).catch(() => {}),
      this.page.waitForURL(/#\/shipping|#\/payment/).catch(() => {})
    ]);

    // Se a URL já estiver no shipping ou payment, pula o preenchimento
    if (this.page.url().includes("#/shipping") || this.page.url().includes("#/payment")) {
      console.log("Dados pessoais já preenchidos pelo Smart Checkout. Avançando...");
      return;
    }

    // Aguarda estabilização do SPA e de requisições de rede em segundo plano para evitar refreshes/resets
    await this.page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});

    await expect(this.firstName).toBeVisible();
    await expect(this.firstName).toBeEnabled();

    // Usa o toPass para lidar de forma blindada com o preenchimento e salvamento do perfil:
    // Se por acaso o SPA da VTEX recarregar ou limpar os campos no meio do processo, 
    // o bloco toPass irá identificar e re-preenchê-los de forma totalmente resiliente.
    await expect(async () => {
      // Verifica e preenche cada campo se estiver vazio
      const currentFirstName = await this.firstName.inputValue().catch(() => "");
      if (!currentFirstName || currentFirstName !== buyer.firstName) {
        await this.firstName.focus();
        await this.firstName.fill(buyer.firstName);
        await this.firstName.press("Tab");
      }

      const currentLastName = await this.lastName.inputValue().catch(() => "");
      if (!currentLastName || currentLastName !== buyer.lastName) {
        await this.lastName.focus();
        await this.lastName.fill(buyer.lastName);
        await this.lastName.press("Tab");
      }

      const currentCpf = await this.cpf.inputValue().catch(() => "");
      // Limpa pontuações para comparação caso o campo aplique máscara automaticamente
      const cleanInputCpf = currentCpf.replace(/\D/g, "");
      const cleanBuyerCpf = buyer.cpf.replace(/\D/g, "");
      if (!cleanInputCpf || cleanInputCpf !== cleanBuyerCpf) {
        await this.cpf.focus();
        await this.cpf.fill(buyer.cpf);
        await this.cpf.press("Tab");
      }

      const currentPhone = await this.phone.inputValue().catch(() => "");
      const cleanInputPhone = currentPhone.replace(/\D/g, "");
      const cleanBuyerPhone = buyer.phone.replace(/\D/g, "");
      if (!cleanInputPhone || cleanInputPhone !== cleanBuyerPhone) {
        await this.phone.focus();
        await this.phone.fill(buyer.phone);
        await this.phone.press("Tab");
      }

      await expect(this.goToShipping).toBeEnabled();
      
      const cookieButton = this.page.getByRole("button", { name: "Permitir todos" });
      if (await cookieButton.isVisible().catch(() => false)) {
        await cookieButton.click({ force: true }).catch(() => {});
      }

      await this.goToShipping.click({ force: true });
      await expect(this.page).toHaveURL(/#\/shipping|#\/payment/);
    }).toPass({ timeout: 45000 });
  }
}

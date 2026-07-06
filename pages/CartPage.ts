import { expect, type Locator, type Page } from "@playwright/test";

export class CartPage {
  readonly page: Page;
  readonly removeButton: Locator;
  readonly continueButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly summary: Locator;

  constructor(page: Page) {
    this.page = page;
    // Escopa os botões de remover estritamente dentro do container de produtos do carrinho,
    // prevenindo conflitos com botões de outras telas (ex: resumos laterais no checkout).
    this.removeButton = page
      .locator(".super-checkout-cart-card-product__container")
      .getByRole("button", { name: "Remover" });
    this.continueButton = page.locator("button.custom-button.buy-button");
    this.emptyCartMessage = page.getByText(
      /carrinho vazio|seu carrinho está vazio/i,
    );
    // Idealmente, substituir por um container escopado:
    // page.getByTestId("cart-summary")
    this.summary = page.locator("body");
  }

  async goto(): Promise<void> {
    await this.page.goto("/checkout/#/cart", {
      waitUntil: "commit",
    });

    // Remove o banner de cookies caso a VTEX tenha o recarregado no contexto do Smart Checkout
    const cookieButton = this.page.getByRole("button", { name: "Permitir todos" });
    try {
      await cookieButton.waitFor({ state: "attached", timeout: 2000 });
      await cookieButton.click({ force: true }).catch(() => {});
    } catch {
      // Sem cookie banner
    }

    const backToCart = this.page.getByRole("link", { name: /voltar para o carrinho/i });

    // Aguarda o botão de voltar aparecer caso ocorra o redirecionamento automático da VTEX.
    // Se aparecer (houve redirecionamento), clica imediatamente. Se não, prossegue de forma imediata!
    try {
      await backToCart.waitFor({ state: "visible", timeout: 1500 });
      await backToCart.click();
      await expect(this.page).toHaveURL(/#\/cart/);
    } catch {
      // Já está seguro na página do carrinho!
    }
  }

  async removeAllItems(): Promise<void> {
    // Primeiro garante que estamos no domínio para que o Playwright envie os cookies de autenticação da sessão na requisição
    await this.goto();

    // Limpeza de carrinho via API do VTEX (rápido e imune a flakiness de UI)
    try {
      const response = await this.page.request.get("/api/checkout/pub/orderForm");
      if (response.ok()) {
        const orderForm = await response.json();
        
        if (orderForm.items && orderForm.items.length > 0) {
          const itemsToRemove = orderForm.items.map((_: any, index: number) => ({
            index,
            quantity: 0,
          }));

          await this.page.request.post(
            `/api/checkout/pub/orderForm/${orderForm.orderFormId}/items/update`,
            {
              data: { orderItems: itemsToRemove },
            }
          );
          
          // Recarrega a página para refletir a limpeza da API na interface
          await this.page.reload({ waitUntil: "load" });
        }
      }
    } catch (error) {
      console.error("Erro ao limpar carrinho via API", error);
    }

    // Fallback UI: remove itens um por um caso a API tenha falhado ou cache retorne itens antigos
    let attempts = 0;
    while (await this.removeButton.first().isVisible().catch(() => false) && attempts < 5) {
      await this.removeFirstItem();
      attempts++;
    }

    // Verifica visualmente se a interface respondeu com carrinho vazio para garantir segurança ao teste
    await expect(this.emptyCartMessage).toBeVisible();
  }

  async removeFirstItem(): Promise<void> {
    await expect(this.removeButton.first()).toBeVisible();
    await expect(this.page.locator("#ajaxShield")).toBeHidden().catch(() => {});
    
    const countBefore = await this.removeButton.count();

    // Usa o toPass para garantir que o clique é repetido se o JS da VTEX ainda não estiver pronto para registrar a ação
    await expect(async () => {
      await expect(this.page.locator("#ajaxShield")).toBeHidden().catch(() => {});

      if (await this.removeButton.first().isVisible().catch(() => false)) {
        await this.removeButton.first().click({ force: true });

        const confirmButton = this.page
          .locator("button:not(.super-checkout-cart-card-product__container button)")
          .filter({ hasText: /confirmar|sim|remover/i })
          .first();

        if (await confirmButton.isVisible().catch(() => false)) {
          await confirmButton.click({ force: true });
        }
      }

      // Aguarda dinamicamente o número de botões diminuir para confirmar que a ação funcionou
      const countAfter = await this.removeButton.count();
      expect(countAfter).toBeLessThan(countBefore);
    }).toPass({ timeout: 10000 });
  }

  async removeItemByName(productName: string): Promise<void> {
    await this.goto();

    // Garante que a página do carrinho está interativa esperando pelo botão de checkout estar pronto
    await expect(this.continueButton).toBeVisible();
    await expect(this.continueButton).toBeEnabled();

    const productCard = this.page
      .locator(".super-checkout-cart-card-product__container")
      .filter({ hasText: productName });

    await expect(productCard).toBeVisible();

    const removeBtn = productCard.getByRole("button", { name: "Remover" });
    await expect(removeBtn).toBeVisible();

    // Usa o toPass para garantir que o clique de remoção surta efeito e o produto suma.
    // Isso evita flakiness quando a VTEX está lenta para carregar o event listener do clique.
    await expect(async () => {
      await expect(this.page.locator("#ajaxShield")).toBeHidden().catch(() => {});

      if (await removeBtn.isVisible().catch(() => false)) {
        await removeBtn.scrollIntoViewIfNeeded();
        await removeBtn.click({ force: true });

        const confirmButton = this.page
          .locator('button:not(.super-checkout-cart-card-product__container button)')
          .filter({ hasText: /confirmar|sim|remover/i })
          .first();

        // Se houver modal de confirmação, clica nele
        try {
          await confirmButton.waitFor({ state: "visible", timeout: 1000 });
          await confirmButton.click({ force: true });
        } catch {
          // Sem confirmação adicional (carrinho com item único ou sem modal)
        }
      }

      // Assertiva chave para que o toPass saiba se a remoção funcionou ou precisa de retry
      await expect(productCard).toBeHidden();
    }).toPass({ timeout: 15000 });
  }

  async continuePurchase(): Promise<void> {
    await expect(this.continueButton).toBeVisible();
    await this.continueButton.click();
  }
}

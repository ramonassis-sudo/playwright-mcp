import { test as setup } from "@playwright/test";
import { HomePage } from "../../pages/HomePage";
import { LoginPage } from "../../pages/LoginPage";
import { credentialsList } from "../../config/test-data";

for (let i = 0; i < credentialsList.length; i++) {
  setup(`authenticate user ${i}`, async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);

    // Executa as ações de login
    await homePage.goto();

    // Aceita cookies para não bloquear as interações e salvar o estado de consentimento
    const cookieButton = page.getByRole("button", { name: "Permitir todos" });
    await cookieButton
      .waitFor({ state: "attached", timeout: 5000 })
      .then(async () => {
        await cookieButton.click({ force: true });
      })
      .catch(() => {});

    await homePage.goToLogin();
    await loginPage.loginWith(credentialsList[i].email, credentialsList[i].password);

    // Salva o estado atual da sessão (cookies e localStorage)
    await page.context().storageState({ path: `playwright/.auth/user-${i}.json` });
  });
}

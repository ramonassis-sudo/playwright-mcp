import { test as base } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { SearchResultsPage } from "../pages/SearchResultsPage";
import { ProductPage } from "../pages/ProductPage";
import { CartPage } from "../pages/CartPage";
import { PersonalDataStep } from "../pages/checkout/PersonalDataStep";
import { ShippingStep } from "../pages/checkout/ShippingStep";
import { PaymentStep } from "../pages/checkout/PaymentStep";
import { credentialsList } from "../config/test-data";
import fs from "fs";
import path from "path";

interface Pages {
  homePage: HomePage;
  loginPage: LoginPage;
  searchResultsPage: SearchResultsPage;
  productPage: ProductPage;
  cartPage: CartPage;
  personalDataStep: PersonalDataStep;
  shippingStep: ShippingStep;
  paymentStep: PaymentStep;
}

/**
 * `test` "base" — entrega os Page Objects prontos para qualquer teste,
 * mas NÃO faz login. Use para CT001/CT002, que não precisam de usuário
 * autenticado.
 */
export const test = base.extend<Pages>({
  homePage: async ({ page }, use) => use(new HomePage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  searchResultsPage: async ({ page }, use) => use(new SearchResultsPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  personalDataStep: async ({ page }, use) => use(new PersonalDataStep(page)),
  shippingStep: async ({ page }, use) => use(new ShippingStep(page)),
  paymentStep: async ({ page }, use) => use(new PaymentStep(page)),
});

/**
 * `authenticatedTest` — igual ao `test` acima, mas a `page` que o teste
 * recebe já chega LOGADA usando storageState de forma "lazy" (preguiçosa/sob demanda).
 * Se o arquivo de sessão correspondente não existir, executa o login dinamicamente.
 */
export const authenticatedTest = test.extend<Pages>({
  storageState: async ({ playwright, baseURL }, use, testInfo) => {
    if (testInfo.project.name === "setup") {
      await use(undefined);
      return;
    }

    // Distribui os usuários entre os workers ativos de forma determinística
    const userIndex = testInfo.workerIndex % 3;
    const authFile = `playwright/.auth/user-${userIndex}.json`;

    // Se o arquivo de sessão correspondente não existir, executa o login sob demanda
    if (!fs.existsSync(authFile)) {
      fs.mkdirSync(path.dirname(authFile), { recursive: true });

      // Lança o tipo correto de navegador de acordo com o projeto atual do Playwright
      const browserType = testInfo.project.name === "firefox"
        ? playwright.firefox
        : testInfo.project.name === "webkit"
          ? playwright.webkit
          : playwright.chromium;

      const browser = await browserType.launch({ headless: true });
      const context = await browser.newContext({ baseURL });
      const page = await context.newPage();

      const homePage = new HomePage(page);
      const loginPage = new LoginPage(page);
      const credentials = credentialsList[userIndex];

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
      await loginPage.loginWith(credentials.email, credentials.password);

      // Salva o estado da sessão (cookies e localStorage)
      await context.storageState({ path: authFile });
      await browser.close();
    }

    await use(authFile);
  },
});

export { expect } from "@playwright/test";

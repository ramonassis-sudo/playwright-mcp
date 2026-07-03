import { requiredEnv, optionalEnv } from "./env";

/**
 * Este módulo é o único lugar do projeto que lê `process.env` para dados
 * de teste. Os specs importam os objetos abaixo (`credentials`, `product`,
 * `order`, `buyer`) em vez de chamar `requiredEnv` diretamente — assim,
 * se uma variável for renomeada no `.env`, você corrige em um único
 * lugar, não em cada arquivo `.spec.ts`.
 *
 * Os VALORES continuam vindo do `.env` (nunca hardcode aqui). Veja o
 * `.env.example` na raiz do projeto para a lista de variáveis esperadas.
 */

export interface Credentials {
  email: string;
  password: string;
}

export interface ProductExpectation {
  searchTerm: string;
  productLinkName: string;
  expectedPrice: string;
  /** Texto de preço "à vista" exibido na página do produto (ex.: "Ou R$ 2.399,00 à vista"). */
  expectedPriceText: string;
}

export interface OrderExpectation {
  expectedFreight: string;
  expectedTotalFinal: string;
}

export interface Buyer {
  firstName: string;
  lastName: string;
  cpf: string;
  phone: string;
  cep: string;
  addressNumber: string;
}

export const baseUrl: string = requiredEnv("BASE_URL");

export const credentialsList: Credentials[] = [
  {
    email: requiredEnv("TEST_USER_EMAIL"),
    password: requiredEnv("TEST_USER_PASSWORD"),
  },
  {
    email: requiredEnv("TEST_USER_EMAIL_2"),
    password: requiredEnv("TEST_USER_PASSWORD_2"),
  },
  {
    email: requiredEnv("TEST_USER_EMAIL_3"),
    password: requiredEnv("TEST_USER_PASSWORD_3"),
  },
];

export const product: ProductExpectation = {
  searchTerm: requiredEnv("SEARCH_TERM"),
  productLinkName: requiredEnv("PRODUCT_LINK_NAME"),
  expectedPrice: requiredEnv("EXPECTED_PRICE"),
  expectedPriceText: optionalEnv(
    "EXPECTED_PRICE_TEXT",
    requiredEnv("EXPECTED_PRICE"),
  ),
};

export const order: OrderExpectation = {
  expectedFreight: requiredEnv("EXPECTED_FREIGHT"),
  expectedTotalFinal: requiredEnv("EXPECTED_TOTAL_FINAL"),
};

export const buyer: Buyer = {
  firstName: requiredEnv("FIRST_NAME"),
  lastName: requiredEnv("LAST_NAME"),
  cpf: requiredEnv("CPF"),
  phone: requiredEnv("PHONE"),
  cep: requiredEnv("CEP"),
  addressNumber: requiredEnv("ADDRESS_NUM"),
};

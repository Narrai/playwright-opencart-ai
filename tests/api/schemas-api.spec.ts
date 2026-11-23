import Ajv from "ajv";
import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { Routes } from "../../api/endpoints/routes";
import { DataProvider } from "../../utils/DataReader";

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
const USER_ID = Number(process.env.USER_ID ?? 1);
const CART_ID = Number(process.env.CART_ID ?? 1);
const ajv = new Ajv({ allErrors: true });

const schemas = {
  product: DataProvider.readJson(
    path.resolve(__dirname, "../../api/schemas/product_api_schema.json"),
  ),
  user: DataProvider.readJson(
    path.resolve(__dirname, "../../api/schemas/user_api_schema.json"),
  ),
  cart: DataProvider.readJson(
    path.resolve(__dirname, "../../api/schemas/cart_api_schema.json"),
  ),
};

function expectSchemaMatch(schema: object, responseBody: unknown, resource: string): void {
  const validate = ajv.compile(schema);
  const valid = validate(responseBody);
  expect(
    valid,
    `${resource} schema validation errors: ${JSON.stringify(validate.errors)}`,
  ).toBe(true);
}

test.describe("FakeStore Response Schema API Tests", () => {
  test("GET - Product response schema @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_PRODUCT_BY_ID.replace("{id}", String(PRODUCT_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    expectSchemaMatch(schemas.product, await response.json(), "Product");
  });

  test("GET - User response schema @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_USER_BY_ID.replace("{id}", String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    expectSchemaMatch(schemas.user, await response.json(), "User");
  });

  test("GET - Cart response schema @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_CART_BY_ID.replace("{id}", String(CART_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    expectSchemaMatch(schemas.cart, await response.json(), "Cart");
  });
});

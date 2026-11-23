import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { RandomDataUtil } from "../../utils/dataGenerator";

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
const LIMIT = Number(process.env.LIMIT ?? 3);
const PRODUCT_CATEGORY = "electronics";

type ProductResponse = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
};

function expectProductFields(product: ProductResponse): void {
  expect(typeof product.id, "Product id should be numeric").toBe("number");
  expect(typeof product.title, "Product title should be a string").toBe("string");
  expect(typeof product.price, "Product price should be numeric").toBe("number");
  expect(typeof product.category, "Product category should be a string").toBe("string");
  expect(typeof product.image, "Product image should be a string").toBe("string");
}

function productRoute(route: string, id: number): string {
  return route.replace("{id}", String(id));
}

test.describe("FakeStore Products API Tests", () => {
  // ---------------------------------------------------------
  // GET - Products
  // ---------------------------------------------------------

  test("GET - All products @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
    expect(response.status(), "Products endpoint should return HTTP 200").toBe(200);

    const products = (await response.json()) as ProductResponse[];
    expect(Array.isArray(products)).toBe(true);
    expect(products.length, "At least one product should be returned").toBeGreaterThan(0);
    products.forEach(expectProductFields);
  });

  test("GET - Product by ID @master @sanity @api", async ({ request }) => {
    const route = productRoute(Routes.GET_PRODUCT_BY_ID, PRODUCT_ID);
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Product lookup should return HTTP 200").toBe(200);

    const product = (await response.json()) as ProductResponse;
    expect(product.id).toBe(PRODUCT_ID);
    expectProductFields(product);
  });

  test("GET - Products with limit @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_PRODUCTS_WITH_LIMIT.replace("{limit}", String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Limited product lookup should return HTTP 200").toBe(200);

    const products = await response.json();
    expect(Array.isArray(products)).toBe(true);
    expect(products).toHaveLength(LIMIT);
  });

  test("GET - Products sorted ascending @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_PRODUCTS_SORTED.replace("{order}", "asc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Ascending product sort should return HTTP 200").toBe(200);

    const products = (await response.json()) as ProductResponse[];
    const ids = products.map((product) => product.id);
    expect(ids).toEqual([...ids].sort((first, second) => first - second));
  });

  test("GET - Products sorted descending @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_PRODUCTS_SORTED.replace("{order}", "desc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Descending product sort should return HTTP 200").toBe(200);

    const products = (await response.json()) as ProductResponse[];
    const ids = products.map((product) => product.id);
    expect(ids).toEqual([...ids].sort((first, second) => second - first));
  });

  test("GET - All product categories @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);
    expect(response.status(), "Product categories should return HTTP 200").toBe(200);

    const categories = (await response.json()) as string[];
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length, "At least one category should be returned").toBeGreaterThan(0);
    expect(categories.every((category) => typeof category === "string")).toBe(true);
  });

  test("GET - Products by category @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_PRODUCTS_BY_CATEGORY.replace(
      "{category}",
      encodeURIComponent(PRODUCT_CATEGORY),
    );
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Category lookup should return HTTP 200").toBe(200);

    const products = (await response.json()) as ProductResponse[];
    expect(Array.isArray(products)).toBe(true);
    expect(products.length, "The selected category should contain products").toBeGreaterThan(0);
    expect(products.every((product) => product.category === PRODUCT_CATEGORY)).toBe(true);
  });

  // ---------------------------------------------------------
  // POST - Create Product
  // ---------------------------------------------------------

  test("POST - Create product @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateProductPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
      data: payload,
    });
    const created = await createResponse.json();

    try {
      expect(createResponse.status(), "Product creation should return HTTP 201").toBe(201);
      expect(typeof created.id, "A numeric product id should be returned").toBe("number");
      expect(created).toMatchObject(payload);
    } finally {
      if (typeof created.id === "number") {
        const cleanupResponse = await request.delete(
          `${BASE_URL}${productRoute(Routes.DELETE_PRODUCT, created.id)}`,
        );
        expect(cleanupResponse.status(), "Created product cleanup should return HTTP 200").toBe(200);
      }
    }
  });

  // ---------------------------------------------------------
  // PUT - Update Product
  // ---------------------------------------------------------

  test("PUT - Update product @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUpdatedProductPayload();
    const route = productRoute(Routes.UPDATE_PRODUCT, PRODUCT_ID);
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });

    expect(response.status(), "Product update should return HTTP 200").toBe(200);

    const updated = await response.json();
    expect(updated.id).toBe(PRODUCT_ID);
    expect(updated).toMatchObject(payload);
  });

  // ---------------------------------------------------------
  // DELETE - Product
  // ---------------------------------------------------------

  test("DELETE - Product @master @regression @api", async ({ request }) => {
    const route = productRoute(Routes.DELETE_PRODUCT, PRODUCT_ID);
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), "Product deletion should return HTTP 200").toBe(200);

    const deleted = await response.json();
    expect(deleted.id).toBe(PRODUCT_ID);
  });
});

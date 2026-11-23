import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { RandomDataUtil } from "../../utils/dataGenerator";

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const CART_ID = Number(process.env.CART_ID ?? 1);
const USER_ID = Number(process.env.USER_ID ?? 1);
const LIMIT = Number(process.env.LIMIT ?? 3);
const START_DATE = process.env.START_DATE || "2019-12-10";
const END_DATE = process.env.END_DATE || "2020-10-10";

type CartProduct = { productId: number; quantity: number };
type CartResponse = {
  id: number;
  userId: number;
  date: string;
  products: CartProduct[];
};

function cartRoute(route: string, id: number): string {
  return route.replace("{id}", String(id));
}

function getUpdatedProducts(products: CartProduct[]): CartProduct[] {
  return products.map((product, index) => ({
    ...product,
    quantity:
      index === 0 ? (product.quantity === 1 ? 2 : 1) : product.quantity,
  }));
}

test.describe("FakeStore Carts API Tests", () => {
  // ---------------------------------------------------------
  // GET - Carts
  // ---------------------------------------------------------

  test("GET - All carts @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);
    expect(response.status(), "Carts endpoint should return HTTP 200").toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts)).toBe(true);
    expect(carts.length, "At least one cart should be returned").toBeGreaterThan(0);
  });

  test("GET - Cart by ID @master @sanity @api", async ({ request }) => {
    const route = cartRoute(Routes.GET_CART_BY_ID, CART_ID);
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Cart lookup should return HTTP 200").toBe(200);

    const cart = (await response.json()) as CartResponse;
    expect(cart.id).toBe(CART_ID);
  });

  test("GET - Carts by date range @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_CARTS_BY_DATE_RANGE
      .replace("{startdate}", encodeURIComponent(START_DATE))
      .replace("{enddate}", encodeURIComponent(END_DATE));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Cart date filter should return HTTP 200").toBe(200);

    const carts = (await response.json()) as Array<{ date: string }>;
    expect(Array.isArray(carts)).toBe(true);

    const startTime = Date.parse(START_DATE);
    const endTime = /^\d{4}-\d{2}-\d{2}$/.test(END_DATE)
      ? Date.parse(`${END_DATE}T23:59:59.999Z`)
      : Date.parse(END_DATE);
    expect(Number.isNaN(startTime)).toBe(false);
    expect(Number.isNaN(endTime)).toBe(false);

    for (const cart of carts) {
      const cartTime = Date.parse(cart.date);
      expect(Number.isNaN(cartTime), "Cart date should be a valid date").toBe(false);
      expect(cartTime).toBeGreaterThanOrEqual(startTime);
      expect(cartTime).toBeLessThanOrEqual(endTime);
    }
  });

  test("GET - Carts by user @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_USER_CART.replace("{userId}", String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "User cart lookup should return HTTP 200").toBe(200);

    const carts = (await response.json()) as Array<{ userId: number }>;
    expect(Array.isArray(carts)).toBe(true);
    expect(carts.length, "The configured user should have carts").toBeGreaterThan(0);
    expect(carts.every((cart) => cart.userId === USER_ID)).toBe(true);
  });

  test("GET - Carts with limit @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_CARTS_WITH_LIMIT.replace("{limit}", String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Limited cart lookup should return HTTP 200").toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts)).toBe(true);
    expect(carts).toHaveLength(LIMIT);
  });

  test("GET - Carts sorted ascending and descending @master @sanity @api", async ({
    request,
  }) => {
    for (const order of ["asc", "desc"] as const) {
      const route = Routes.GET_CARTS_SORTED.replace("{order}", order);
      const response = await request.get(`${BASE_URL}${route}`);
      expect(response.status(), `Cart sort (${order}) should return HTTP 200`).toBe(200);

      const carts = (await response.json()) as Array<{ id: number }>;
      const ids = carts.map((cart) => cart.id);
      const sortedIds = [...ids].sort((first, second) =>
        order === "asc" ? first - second : second - first,
      );
      expect(ids, `Cart IDs should be sorted ${order}`).toEqual(sortedIds);
    }
  });

  // ---------------------------------------------------------
  // POST - Create Cart
  // ---------------------------------------------------------

  test("POST - Create cart @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateCartPayload(USER_ID);
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
      data: payload,
    });
    const created = await createResponse.json();

    try {
      expect(createResponse.status(), "Cart creation should return HTTP 201").toBe(201);
      expect(typeof created.id, "A numeric cart id should be returned").toBe("number");
      expect(created.userId).toBe(payload.userId);
      expect(created.products).toEqual(payload.products);
    } finally {
      if (typeof created.id === "number") {
        const cleanupResponse = await request.delete(
          `${BASE_URL}${cartRoute(Routes.DELETE_CART, created.id)}`,
        );
        expect(cleanupResponse.status(), "Created cart cleanup should return HTTP 200").toBe(200);
      }
    }
  });

  // ---------------------------------------------------------
  // PUT - Update Cart
  // ---------------------------------------------------------

  test("PUT - Update cart quantity @master @regression @api", async ({ request }) => {
    const lookupRoute = cartRoute(Routes.GET_CART_BY_ID, CART_ID);
    const lookupResponse = await request.get(`${BASE_URL}${lookupRoute}`);
    expect(lookupResponse.status(), "The cart to update should return HTTP 200").toBe(200);
    const existing = (await lookupResponse.json()) as CartResponse;
    expect(existing.products.length).toBeGreaterThan(0);

    const payload = RandomDataUtil.generateUpdatedCartPayload(existing.userId);
    payload.date = existing.date;
    payload.products = getUpdatedProducts(existing.products);

    const updateRoute = cartRoute(Routes.UPDATE_CART, CART_ID);
    const response = await request.put(`${BASE_URL}${updateRoute}`, { data: payload });
    expect(response.status(), "Cart update should return HTTP 200").toBe(200);

    const updated = (await response.json()) as CartResponse;
    expect(updated.id).toBe(CART_ID);
    expect(updated.products[0].quantity).toBe(payload.products[0].quantity);
  });

  // ---------------------------------------------------------
  // DELETE - Cart
  // ---------------------------------------------------------

  test("DELETE - Cart @master @regression @api", async ({ request }) => {
    const route = cartRoute(Routes.DELETE_CART, CART_ID);
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), "Cart deletion should return HTTP 200").toBe(200);

    const deleted = await response.json();
    expect(deleted.id).toBe(CART_ID);
  });
});

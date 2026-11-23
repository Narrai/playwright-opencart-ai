import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { RandomDataUtil } from "../../utils/dataGenerator";

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const USER_ID = Number(process.env.USER_ID ?? 1);

function resourceRoute(route: string, id: number): string {
  return route.replace("{id}", String(id));
}

function updatedCartProducts(
  products: Array<{ productId: number; quantity: number }>,
): Array<{ productId: number; quantity: number }> {
  return products.map((product, index) => ({
    ...product,
    quantity:
      index === 0 ? (product.quantity === 1 ? 2 : 1) : product.quantity,
  }));
}

test.describe.serial("FakeStore Product CRUD Workflow", () => {
  test("POST, PUT, DELETE - Product workflow @master @regression @api", async ({
    request,
  }) => {
    const createPayload = RandomDataUtil.generateProductPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
      data: createPayload,
    });
    const created = await createResponse.json();

    expect(createResponse.status()).toBe(201);
    expect(typeof created.id).toBe("number");
    const productId: number = created.id;

    try {
      const updatePayload = RandomDataUtil.generateUpdatedProductPayload();
      const updateRoute = resourceRoute(Routes.UPDATE_PRODUCT, productId);
      const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, {
        data: updatePayload,
      });
      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();
      expect(updated.id).toBe(productId);
      expect(updated).toMatchObject(updatePayload);
    } finally {
      const deleteRoute = resourceRoute(Routes.DELETE_PRODUCT, productId);
      const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
      expect(deleteResponse.status()).toBe(200);
    }
  });
});

test.describe.serial("FakeStore User CRUD Workflow", () => {
  test("POST, PUT, DELETE - User workflow @master @regression @api", async ({
    request,
  }) => {
    const createPayload = RandomDataUtil.generateUserPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
      data: createPayload,
    });
    const created = await createResponse.json();

    expect(createResponse.status()).toBe(201);
    expect(typeof created.id).toBe("number");
    const userId: number = created.id;

    try {
      const updatePayload = RandomDataUtil.generateUserUpdatePayload();
      const updateRoute = resourceRoute(Routes.UPDATE_USER, userId);
      const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, {
        data: updatePayload,
      });
      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();
      expect(updated).toMatchObject(updatePayload);
    } finally {
      const deleteRoute = resourceRoute(Routes.DELETE_USER, userId);
      const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
      expect(deleteResponse.status()).toBe(200);
    }
  });
});

test.describe.serial("FakeStore Cart CRUD Workflow", () => {
  test("POST, PUT, DELETE - Cart workflow @master @regression @api", async ({
    request,
  }) => {
    const createPayload = RandomDataUtil.generateCartPayload(USER_ID);
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
      data: createPayload,
    });
    const created = await createResponse.json();

    expect(createResponse.status()).toBe(201);
    expect(typeof created.id).toBe("number");
    expect(created.userId).toBe(USER_ID);
    expect(created.products).toEqual(createPayload.products);
    const cartId: number = created.id;

    try {
      const updatePayload = RandomDataUtil.generateUpdatedCartPayload(USER_ID);
      updatePayload.date = createPayload.date;
      updatePayload.products = updatedCartProducts(createPayload.products);

      const updateRoute = resourceRoute(Routes.UPDATE_CART, cartId);
      const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, {
        data: updatePayload,
      });
      expect(updateResponse.status()).toBe(200);

      const updated = await updateResponse.json();
      expect(updated.id).toBe(cartId);
      expect(updated.userId).toBe(USER_ID);
      expect(updated.products[0].quantity).toBe(updatePayload.products[0].quantity);
    } finally {
      const deleteRoute = resourceRoute(Routes.DELETE_CART, cartId);
      const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
      expect(deleteResponse.status()).toBe(200);
    }
  });
});

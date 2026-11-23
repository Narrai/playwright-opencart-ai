import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { RandomDataUtil } from "../../utils/dataGenerator";

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const USER_ID = Number(process.env.USER_ID ?? 1);
const LIMIT = Number(process.env.LIMIT ?? 3);

function userRoute(route: string, id: number): string {
  return route.replace("{id}", String(id));
}

test.describe("FakeStore Users API Tests", () => {
  // ---------------------------------------------------------
  // GET - Users
  // ---------------------------------------------------------

  test("GET - All users @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);
    expect(response.status(), "Users endpoint should return HTTP 200").toBe(200);

    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length, "At least one user should be returned").toBeGreaterThan(0);
  });

  test("GET - User by ID @master @sanity @api", async ({ request }) => {
    const route = userRoute(Routes.GET_USER_BY_ID, USER_ID);
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "User lookup should return HTTP 200").toBe(200);

    const user = await response.json();
    expect(user.id).toBe(USER_ID);
  });

  test("GET - Users with limit @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_USERS_WITH_LIMIT.replace("{limit}", String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Limited user lookup should return HTTP 200").toBe(200);

    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users).toHaveLength(LIMIT);
  });

  test("GET - Users sorted ascending and descending @master @sanity @api", async ({
    request,
  }) => {
    for (const order of ["asc", "desc"] as const) {
      const route = Routes.GET_USERS_SORTED.replace("{order}", order);
      const response = await request.get(`${BASE_URL}${route}`);
      expect(response.status(), `User sort (${order}) should return HTTP 200`).toBe(200);

      const users = (await response.json()) as Array<{ id: number }>;
      const ids = users.map((user) => user.id);
      const sortedIds = [...ids].sort((first, second) =>
        order === "asc" ? first - second : second - first,
      );
      expect(ids, `User IDs should be sorted ${order}`).toEqual(sortedIds);
    }
  });

  // ---------------------------------------------------------
  // POST - Create User
  // ---------------------------------------------------------

  test("POST - Create user @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUserPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
      data: payload,
    });
    const created = await createResponse.json();

    try {
      expect(createResponse.status(), "User creation should return HTTP 201").toBe(201);
      expect(typeof created.id, "A numeric user id should be returned").toBe("number");
    } finally {
      if (typeof created.id === "number") {
        const cleanupResponse = await request.delete(
          `${BASE_URL}${userRoute(Routes.DELETE_USER, created.id)}`,
        );
        expect(cleanupResponse.status(), "Created user cleanup should return HTTP 200").toBe(200);
      }
    }
  });

  // ---------------------------------------------------------
  // PUT - Update User
  // ---------------------------------------------------------

  test("PUT - Update user @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUserUpdatePayload();
    const route = userRoute(Routes.UPDATE_USER, USER_ID);
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });

    expect(response.status(), "User update should return HTTP 200").toBe(200);

    const updated = await response.json();
    expect(updated).toMatchObject(payload);
  });

  // ---------------------------------------------------------
  // DELETE - User
  // ---------------------------------------------------------

  test("DELETE - User @master @regression @api", async ({ request }) => {
    const route = userRoute(Routes.DELETE_USER, USER_ID);
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), "User deletion should return HTTP 200").toBe(200);

    const deleted = await response.json();
    expect(deleted.id).toBe(USER_ID);
  });
});

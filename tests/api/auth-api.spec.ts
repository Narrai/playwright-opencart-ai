import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { RandomDataUtil } from "../../utils/dataGenerator";

const envFile = dotenv.config();
const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

function getValidCredentials(): { username: string; password: string } {
  const username = process.env.FAKESTORE_USERNAME ?? envFile.parsed?.USERNAME ?? process.env.USERNAME;
  const password = process.env.FAKESTORE_PASSWORD ?? envFile.parsed?.PASSWORD ?? process.env.PASSWORD;

  if (!username || !password) {
    throw new Error("Set FakeStore credentials in .env as USERNAME and PASSWORD.");
  }

  return { username, password };
}

test.describe("FakeStore Authentication API Tests", () => {
  // ---------------------------------------------------------
  // POST - Login
  // ---------------------------------------------------------

  test("POST - Successful login @master @sanity @api", async ({ request }) => {
    const credentials = getValidCredentials();
    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: credentials,
    });

    expect(response.status(), "Login should return HTTP 201").toBe(201);

    const responseBody = await response.json();
    expect(typeof responseBody.token, "The response should include a token").toBe("string");
    expect(responseBody.token.length, "The token should not be empty").toBeGreaterThan(0);
  });

  // ---------------------------------------------------------
  // POST - Invalid Login
  // ---------------------------------------------------------

  test("POST - Invalid login @master @regression @api", async ({ request }) => {
    const invalidCredentials = RandomDataUtil.generateInvalidLoginPayload();
    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: invalidCredentials,
    });

    expect(response.status(), "Invalid credentials should return HTTP 401").toBe(401);

    const responseBody = await response.text();
    expect(responseBody).toBe("username or password is incorrect");
  });
});

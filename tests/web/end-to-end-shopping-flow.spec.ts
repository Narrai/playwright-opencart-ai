import { test, expect } from "../../fixtures/pageFixtures";
import { RandomDataUtil } from "../../utils/dataGenerator";
import { Helper } from "../../utils/helper";

/**
 * Test Case: End-to-end customer shopping flow
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Open the application
 * 2) Register and verify a new customer
 * 3) Log out and authenticate with the new credentials
 * 4) Search for MacBook and add it to the cart
 * 5) Verify the cart product, quantity, unit price, and total
 */
test("End-to-End Shopping Flow @master @sanity @regression @web", async ({
  page,
  homePage,
  registerPage,
  loginPage,
  accountPage,
  searchResultsPage,
  productPage,
  cartPage,
}) => {
  const product = Helper.getProductDetails();
  const customer = {
    firstName: RandomDataUtil.getFirstName(),
    lastName: RandomDataUtil.getLastName(),
    email: `e2e-${Date.now()}-${RandomDataUtil.getEmail()}`,
    password: RandomDataUtil.getPassword(),
  };
  const browserErrors: string[] = [];

  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push(message.text());
    }
  });

  await test.step("1) Open the application", async () => {
    expect(await homePage.isStorefrontDisplayed()).toBeTruthy();
  });

  await test.step("2) Register a new customer", async () => {
    await homePage.navigateToRegistration();
    await registerPage.completeRegistration(customer);
  });

  await test.step("3) Verify successful registration", async () => {
    await registerPage.waitForRegistrationSuccess();
  });

  await test.step("4) Log out", async () => {
    await homePage.logout();
    expect(await accountPage.isLogoutConfirmationDisplayed()).toBeTruthy();
  });

  await test.step("5) Log in with the new customer credentials", async () => {
    await homePage.navigateToLogin();
    await loginPage.login(customer.email, customer.password);
  });

  await test.step("6) Verify successful authentication", async () => {
    await accountPage.waitForDashboard();
  });

  await test.step("7) Search for the known product", async () => {
    await homePage.searchProduct(product.productName);
    expect(await searchResultsPage.isProductDisplayed(product.productName)).toBeTruthy();
  });

  await test.step("8) Open the product details page", async () => {
    await searchResultsPage.openProduct(product.productName);
    expect(await productPage.isProductDisplayed(product.productName)).toBeTruthy();
  });

  await test.step("9) Add the product to the cart", async () => {
    await productPage.setQuantity(product.productQuantity);
    await productPage.addToCart();
    expect(await productPage.getAddToCartConfirmation()).toContain(
      `Success: You have added ${product.productName} to your shopping cart!`,
    );
  });

  await test.step("10) Open the shopping cart", async () => {
    await productPage.openShoppingCart();
  });

  await test.step("11) Verify the correct product is in the cart", async () => {
    expect(await cartPage.isProductInCart(product.productName)).toBeTruthy();
  });

  await test.step("12) Verify the product quantity", async () => {
    expect(await cartPage.getProductQuantity(product.productName)).toBe(
      product.productQuantity,
    );
  });

  await test.step("13) Verify the product price", async () => {
    const displayedUnitPrice = await cartPage.getProductUnitPrice(product.productName);
    expect(Helper.convertPriceToNumber(displayedUnitPrice)).toBe(
      Helper.convertPriceToNumber(product.totalPrice),
    );
  });

  await test.step("14) Verify the applicable cart total", async () => {
    const displayedCartTotal = await cartPage.getCartTotal();
    expect(Helper.convertPriceToNumber(displayedCartTotal)).toBe(
      Helper.convertPriceToNumber(product.totalPrice),
    );
  });

  await test.step("15) Verify the journey finishes without browser errors", async () => {
    expect(browserErrors).toEqual([]);
  });

  console.log("✅ End-to-end shopping flow completed successfully.");
});

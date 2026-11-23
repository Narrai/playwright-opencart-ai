import dotenv from "dotenv";
import { type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import { test, expect } from "../../fixtures/pageFixtures";
import { RegisterPage } from "../../pages/RegisterPage";
import { RandomDataUtil } from "../../utils/dataGenerator";
import { executeQuery } from "../../utils/dbClient";

dotenv.config();

const ADMIN_APP_URL =
  process.env.ADMIN_APP_URL ||
  "http://localhost/opencart/opencartadmin/index.php";

interface CustomerRow extends RowDataPacket {
  customer_id: number;
  firstname: string;
  lastname: string;
  email: string;
  status: number;
  date_added: Date | string;
}

function getAdminCredentials(): { username: string; password: string } {
  const { ADMIN_USERNAME: username, ADMIN_PASSWORD: password } = process.env;

  if (!username || !password) {
    throw new Error("Set ADMIN_USERNAME and ADMIN_PASSWORD in the test environment.");
  }

  return { username, password };
}

test("Customer registration persists in Admin and MySQL @master @regression @db @end-to-end", async ({
  page,
  homePage,
  registerPage,
  adminCustomersPage,
}) => {
  const password = RandomDataUtil.getPassword();
  const customer = {
    firstName: RandomDataUtil.getFirstName(),
    lastName: RandomDataUtil.getLastName(),
    email: `db-${Date.now()}-${RandomDataUtil.getEmail()}`.toLowerCase(),
    telephone: RandomDataUtil.getPhoneNumber(),
    password,
    confirmPassword: password,
  };
  let registrationAttempted = false;

  try {
    await test.step("Register a unique customer through the storefront", async () => {
      expect(await homePage.isStorefrontDisplayed()).toBeTruthy();
      await homePage.navigateToRegistration();
      await expect(
        page.getByRole("heading", { name: "Register Account", exact: true }),
      ).toBeVisible();

      registrationAttempted = true;
      await registerPage.completeRegistration(customer);
      await registerPage.waitForRegistrationSuccess();
    });

    await test.step("Find and validate the customer in OpenCart Admin", async () => {
      const { username, password: adminPassword } = getAdminCredentials();
      await page.goto(ADMIN_APP_URL);
      await adminCustomersPage.login(username, adminPassword);
      await adminCustomersPage.openCustomerList();
      await adminCustomersPage.searchByEmail(customer.email);

      const customerRow = adminCustomersPage.getCustomerRow(customer.email);
      await expect(customerRow, "The registered customer should appear in Admin").toHaveCount(1);
      await expect(customerRow).toContainText(customer.email);

      await adminCustomersPage.openCustomerDetails(customer.email);
      const adminCustomer = await adminCustomersPage.getCustomerDetails();
      expect(adminCustomer.firstName, "Admin first name should match registration").toBe(
        customer.firstName,
      );
      expect(adminCustomer.lastName, "Admin last name should match registration").toBe(
        customer.lastName,
      );
      expect(adminCustomer.email, "Admin email should match registration").toBe(customer.email);
      expect(adminCustomer.enabled, "Newly registered customers should be enabled").toBe(true);
    });

    await test.step("Verify the customer row in MySQL", async () => {
      const [customers] = await executeQuery<CustomerRow[]>(
        `SELECT customer_id, firstname, lastname, email, status, date_added
         FROM oc_customer
         WHERE email = ?`,
        [customer.email],
      );

      expect(
        customers,
        "Exactly one customer row should match the unique registration email",
      ).toHaveLength(1);

      const [customerRow] = customers;
      if (!customerRow) {
        throw new Error("The registered customer was not found in oc_customer.");
      }

      expect(customerRow.firstname, "Database first name should match registration").toBe(
        customer.firstName,
      );
      expect(customerRow.lastname, "Database last name should match registration").toBe(
        customer.lastName,
      );
      expect(customerRow.email, "Database email should match registration").toBe(customer.email);
      expect(customerRow.status, "Newly registered customers should be enabled").toBe(1);
      expect(customerRow.date_added, "The customer date_added value should be present").toBeTruthy();
    });
  } finally {
    if (registrationAttempted) {
      await executeQuery<ResultSetHeader>(
        "DELETE FROM oc_customer WHERE email = ?",
        [customer.email],
      );
    }
  }
});

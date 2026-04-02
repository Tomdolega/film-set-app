import "dotenv/config";

import { and, eq } from "drizzle-orm";

import { DrizzleOrganizationsRepository } from "../repositories/organizations.repository.js";
import { DrizzleUsersRepository } from "../repositories/users.repository.js";
import { createDatabaseClient, getDatabaseErrorMessage } from "../client/db.js";
import { organizationMembers } from "../schema/organization-members.js";
import { organizations } from "../schema/organizations.js";

const DEFAULT_USER_ID = "11111111-1111-1111-1111-111111111111";
const DEFAULT_USER_EMAIL = "owner@example.com";
const DEFAULT_USER_NAME = "Mock Owner";
const DEFAULT_ORGANIZATION_ID = "22222222-2222-2222-2222-222222222222";
const DEFAULT_ORGANIZATION_NAME = "Demo Organization";

async function main() {
  const databaseClient = createDatabaseClient();
  const usersRepository = new DrizzleUsersRepository(databaseClient.db);
  const organizationsRepository = new DrizzleOrganizationsRepository(databaseClient.db);

  const sessionUser = {
    id: process.env.MOCK_USER_ID ?? DEFAULT_USER_ID,
    email: process.env.MOCK_USER_EMAIL ?? DEFAULT_USER_EMAIL,
    name: process.env.MOCK_USER_NAME ?? DEFAULT_USER_NAME,
  };

  const organizationId = process.env.DEV_SEED_ORGANIZATION_ID ?? DEFAULT_ORGANIZATION_ID;
  const organizationName = process.env.DEV_SEED_ORGANIZATION_NAME ?? DEFAULT_ORGANIZATION_NAME;

  try {
    await usersRepository.upsertSessionUser(sessionUser);

    const existingOrganization = await organizationsRepository.findOrganizationById(organizationId);
    const organization =
      existingOrganization ??
      (
        await databaseClient.db
          .insert(organizations)
          .values({
            id: organizationId,
            name: organizationName,
          })
          .returning()
      )[0];

    const existingMembership = await databaseClient.db.query.organizationMembers.findFirst({
      where: and(
        eq(organizationMembers.organizationId, organization.id),
        eq(organizationMembers.userId, sessionUser.id),
      ),
    });

    if (!existingMembership) {
      await organizationsRepository.addOrganizationMember({
        organizationId: organization.id,
        userId: sessionUser.id,
        role: "owner",
      });
    }

    console.log(
      JSON.stringify(
        {
          userId: sessionUser.id,
          organizationId: organization.id,
          organizationName: organization.name,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(getDatabaseErrorMessage(error));
    process.exitCode = 1;
  } finally {
    await databaseClient.close();
  }
}

void main();


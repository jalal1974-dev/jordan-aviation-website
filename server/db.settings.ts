import { programSettings } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "./db";

/**
 * Get all program settings
 */
export async function getAllSettings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(programSettings);
}

/**
 * Get settings by category
 */
export async function getSettingsByCategory(category: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(programSettings)
    .where(eq(programSettings.category, category));
}

/**
 * Get a specific setting by key
 */
export async function getSettingByKey(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select()
    .from(programSettings)
    .where(eq(programSettings.settingKey, key))
    .limit(1);
  return result[0] || null;
}

/**
 * Update or create a setting
 */
export async function upsertSetting(
  key: string,
  value: string,
  category: string,
  dataType: string,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getSettingByKey(key);

  if (existing) {
    return db
      .update(programSettings)
      .set({
        settingValue: value,
        description,
        updatedAt: new Date(),
      })
      .where(eq(programSettings.settingKey, key));
  } else {
    return db.insert(programSettings).values({
      settingKey: key,
      settingValue: value,
      category,
      dataType,
      description,
    });
  }
}

/**
 * Delete a setting
 */
export async function deleteSetting(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .delete(programSettings)
    .where(eq(programSettings.settingKey, key));
}

/**
 * Get loyalty program settings
 */
export async function getLoyaltySettings() {
  return getSettingsByCategory("loyalty");
}

/**
 * Get affiliate program settings
 */
export async function getAffiliateSettings() {
  return getSettingsByCategory("affiliate");
}

/**
 * Parse setting value based on data type
 */
export function parseSettingValue(value: string, dataType: string): any {
  switch (dataType) {
    case "number":
      return parseFloat(value);
    case "boolean":
      return value.toLowerCase() === "true";
    case "json":
      return JSON.parse(value);
    default:
      return value;
  }
}

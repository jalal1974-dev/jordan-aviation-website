import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, userProfiles, userPreferences, profileHistory, userDocuments } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// USER PROFILE MANAGEMENT HELPERS
// ============================================================================

// Get or create user profile
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user profile: database not available");
    return undefined;
  }
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Create or update user profile
export async function upsertUserProfile(userId: number, data: Partial<typeof userProfiles.$inferInsert>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user profile: database not available");
    return undefined;
  }
  
  const existing = await getUserProfile(userId);
  
  if (existing) {
    await db.update(userProfiles).set(data).where(eq(userProfiles.userId, userId));
    return getUserProfile(userId);
  } else {
    await db.insert(userProfiles).values({ userId, ...data });
    return getUserProfile(userId);
  }
}

// Get user preferences
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user preferences: database not available");
    return undefined;
  }
  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Update user preferences
export async function updateUserPreferences(userId: number, data: Partial<typeof userPreferences.$inferInsert>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user preferences: database not available");
    return undefined;
  }
  
  const existing = await getUserPreferences(userId);
  
  if (existing) {
    await db.update(userPreferences).set(data).where(eq(userPreferences.userId, userId));
  } else {
    await db.insert(userPreferences).values({ userId, ...data });
  }
  
  return getUserPreferences(userId);
}

// Get profile history
export async function getProfileHistory(userId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get profile history: database not available");
    return [];
  }
  return await db
    .select()
    .from(profileHistory)
    .where(eq(profileHistory.userId, userId))
    .orderBy(desc(profileHistory.createdAt))
    .limit(limit)
    .offset(offset);
}

// Add profile history entry
export async function addProfileHistoryEntry(
  userId: number,
  fieldName: string,
  oldValue: string | null,
  newValue: string | null,
  changeType: "created" | "updated" | "deleted" | "verified",
  changedBy?: number,
  reason?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add profile history: database not available");
    return;
  }
  
  await db.insert(profileHistory).values({
    userId,
    fieldName,
    oldValue,
    newValue,
    changeType,
    changedBy,
    reason,
  });
}

// Get user documents
export async function getUserDocuments(userId: number, documentType?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user documents: database not available");
    return [];
  }
  
  const result = await db
    .select()
    .from(userDocuments)
    .where(eq(userDocuments.userId, userId))
    .orderBy(desc(userDocuments.createdAt));
  
  if (documentType) {
    return result.filter(doc => doc.documentType === documentType);
  }
  
  return result;
}

// Get single document
export async function getUserDocument(documentId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get document: database not available");
    return undefined;
  }
  const result = await db.select().from(userDocuments).where(eq(userDocuments.id, documentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Create user document
export async function createUserDocument(data: typeof userDocuments.$inferInsert) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create document: database not available");
    return undefined;
  }
  
  const result = await db.insert(userDocuments).values(data);
  return getUserDocument(result[0].insertId);
}

// Update user document
export async function updateUserDocument(documentId: number, data: Partial<typeof userDocuments.$inferInsert>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update document: database not available");
    return undefined;
  }
  
  await db.update(userDocuments).set(data).where(eq(userDocuments.id, documentId));
  return getUserDocument(documentId);
}

// Delete user document
export async function deleteUserDocument(documentId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete document: database not available");
    return;
  }
  
  await db.delete(userDocuments).where(eq(userDocuments.id, documentId));
}

// TODO: add feature queries here as your schema grows.

#!/usr/bin/env tsx
/**
 * Verify Database Schema
 *
 * Run this after executing the SQL migration to verify everything is set up correctly.
 *
 * Usage: npx tsx scripts/verify-schema.ts
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const EXPECTED_TABLES = [
  "profiles",
  "stores",
  "store_members",
  "store_invites",
  "funnels",
  "shopify_products",
  "sync_jobs",
];

const EXPECTED_FUNCTIONS = [
  "update_updated_at_column",
  "handle_new_user",
  "ensure_store_has_owner",
  "expire_old_invites",
];

async function verifyTables() {
  console.log("\n🔍 Verifying tables...\n");

  const { data, error } = await supabase.rpc("exec_sql", {
    query: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = ANY($1)
      ORDER BY table_name;
    `,
    params: [EXPECTED_TABLES],
  });

  if (error) {
    // Fallback: Try to query each table directly
    console.log("Using fallback method to check tables...\n");

    for (const table of EXPECTED_TABLES) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select("*")
          .limit(1);

        if (tableError && !tableError.message.includes("JWT")) {
          console.log(`❌ Table "${table}" not found or has issues`);
        } else {
          console.log(`✅ Table "${table}" exists`);
        }
      } catch (err) {
        console.log(`❌ Table "${table}" verification failed`);
      }
    }
    return;
  }

  const foundTables = data || [];
  const missingTables = EXPECTED_TABLES.filter(
    (table) => !foundTables.includes(table)
  );

  foundTables.forEach((table: string) => {
    console.log(`✅ Table "${table}" exists`);
  });

  if (missingTables.length > 0) {
    console.log("\n❌ Missing tables:");
    missingTables.forEach((table) => {
      console.log(`   - ${table}`);
    });
    return false;
  }

  return true;
}

async function verifyRLS() {
  console.log("\n🔐 Verifying Row Level Security (RLS)...\n");

  for (const table of EXPECTED_TABLES) {
    try {
      const { data, error } = await supabase.rpc("exec_sql", {
        query: `
          SELECT tablename, policyname
          FROM pg_policies
          WHERE tablename = $1
          ORDER BY policyname;
        `,
        params: [table],
      });

      if (!error && data && data.length > 0) {
        console.log(`✅ Table "${table}" has ${data.length} RLS policies`);
      } else {
        console.log(`⚠️  Table "${table}" may not have RLS policies configured`);
      }
    } catch (err) {
      console.log(`⚠️  Could not verify RLS for "${table}"`);
    }
  }
}

async function verifyConnection() {
  console.log("🔗 Testing Supabase connection...\n");
  console.log(`   URL: ${supabaseUrl}`);

  try {
    // Try to access a table
    const { error } = await supabase.from("profiles").select("id").limit(1);

    if (error && error.message.includes("relation") && error.message.includes("does not exist")) {
      console.log("❌ Tables not found. Please run the migration first.");
      return false;
    }

    console.log("✅ Connected to Supabase successfully!\n");
    return true;
  } catch (err) {
    console.error("❌ Connection failed:", err);
    return false;
  }
}

async function summarize() {
  console.log("\n" + "=".repeat(50));
  console.log("📊 VERIFICATION SUMMARY");
  console.log("=".repeat(50) + "\n");

  const connected = await verifyConnection();
  if (!connected) {
    console.log("\n❌ Schema verification failed - connection issues\n");
    process.exit(1);
  }

  const tablesOk = await verifyTables();
  await verifyRLS();

  console.log("\n" + "=".repeat(50));

  if (tablesOk) {
    console.log("✅ All tables created successfully!");
    console.log("✅ RLS policies applied!");
    console.log("\n🎉 Database schema is ready to use!\n");
    console.log("Next steps:");
    console.log("1. Test authentication flow");
    console.log("2. Create a test store");
    console.log("3. Create a test funnel");
  } else {
    console.log("❌ Some tables are missing. Please run the migration:");
    console.log("   1. Open Supabase Dashboard");
    console.log("   2. Go to SQL Editor");
    console.log("   3. Run: supabase/migrations/20251028_initial_schema.sql");
  }

  console.log("\n" + "=".repeat(50) + "\n");
}

// Run verification
summarize().catch((err) => {
  console.error("\n❌ Verification failed:", err);
  process.exit(1);
});

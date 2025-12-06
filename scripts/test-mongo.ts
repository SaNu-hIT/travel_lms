import mongoose from "mongoose";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/lms_saas";

async function testConnection() {
  console.log("🔍 Testing MongoDB connection...");
  console.log("📍 Connection string:", MONGODB_URI.replace(/:[^:@]+@/, ":****@")); // Hide password

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Successfully connected to MongoDB!");

    // Test database operations
    const collections = await mongoose.connection.db?.listCollections().toArray();
    console.log(`📦 Found ${collections?.length || 0} collections`);

    if (collections && collections.length > 0) {
      console.log("📋 Collections:", collections.map(c => c.name).join(", "));
    }

    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Connection failed!");
    console.error("Error:", error.message);

    if (error.message.includes("authentication")) {
      console.log("\n💡 Tip: Check your username and password");
    } else if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 Tip: MongoDB server is not running or unreachable");
    } else if (error.message.includes("MongoServerError")) {
      console.log("\n💡 Tip: Check your connection string format");
    }

    process.exit(1);
  }
}

testConnection();

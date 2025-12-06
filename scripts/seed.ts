import mongoose from "mongoose";
import { config } from "dotenv";
import { resolve } from "path";
import { hashPassword } from "../lib/auth";
import Tenant from "../models/Tenant";
import User from "../models/User";
import Lead from "../models/Lead";
import {
  TenantPlan,
  TenantStatus,
  UserRole,
  LeadStatus,
  LeadSource,
} from "../types";

// Load .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/lms_saas";

async function seed() {
  try {
    console.log("🌱 Starting database seed...");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Tenant.deleteMany({});
    await User.deleteMany({});
    await Lead.deleteMany({});

    // Create SaaS Admin Tenant (for SaaS Admin user)
    console.log("📦 Creating SaaS Admin tenant...");
    const saasAdminTenant = await Tenant.create({
      name: "LMS Platform Admin",
      plan: TenantPlan.ENTERPRISE,
      status: TenantStatus.ACTIVE,
      maxUsers: 1000,
    });

    // Create SaaS Admin User
    console.log("👤 Creating SaaS Admin user...");
    await User.create({
      tenantId: saasAdminTenant._id,
      email: "admin@lmsplatform.com",
      password: await hashPassword("admin123"),
      name: "SaaS Admin",
      role: UserRole.SAAS_ADMIN,
      isActive: true,
    });

    // Create Demo Tenant 1: Acme Corp
    console.log("🏢 Creating Acme Corp tenant...");
    const acmeTenant = await Tenant.create({
      name: "Acme Corporation",
      domain: "acme.com",
      plan: TenantPlan.PREMIUM,
      status: TenantStatus.ACTIVE,
      maxUsers: 50,
    });

    // Create Acme Corp Admin
    console.log("👤 Creating Acme Corp users...");
    const acmeAdmin = await User.create({
      tenantId: acmeTenant._id,
      email: "admin@acme.com",
      password: await hashPassword("admin123"),
      name: "John Admin",
      role: UserRole.ADMIN,
      isActive: true,
    });

    // Create Acme Corp Manager
    const acmeManager = await User.create({
      tenantId: acmeTenant._id,
      email: "manager@acme.com",
      password: await hashPassword("manager123"),
      name: "Sarah Manager",
      role: UserRole.MANAGER,
      isActive: true,
    });

    // Create Acme Corp Employees
    const acmeEmployee1 = await User.create({
      tenantId: acmeTenant._id,
      email: "employee1@acme.com",
      password: await hashPassword("employee123"),
      name: "Mike Employee",
      role: UserRole.EMPLOYEE,
      managerId: acmeManager._id,
      isActive: true,
    });

    const acmeEmployee2 = await User.create({
      tenantId: acmeTenant._id,
      email: "employee2@acme.com",
      password: await hashPassword("employee123"),
      name: "Lisa Employee",
      role: UserRole.EMPLOYEE,
      managerId: acmeManager._id,
      isActive: true,
    });

    // Create Leads for Acme Corp
    console.log("📋 Creating leads for Acme Corp...");
    const acmeLeads = [
      {
        tenantId: acmeTenant._id,
        name: "Alice Johnson",
        email: "alice@techstart.com",
        phone: "+1-555-0101",
        company: "TechStart Inc",
        source: LeadSource.WEBSITE,
        status: LeadStatus.NEW,
        assignedToId: acmeEmployee1._id,
        createdById: acmeAdmin._id,
        comments: [],
      },
      {
        tenantId: acmeTenant._id,
        name: "Bob Smith",
        email: "bob@innovate.io",
        phone: "+1-555-0102",
        company: "Innovate Solutions",
        source: LeadSource.REFERRAL,
        status: LeadStatus.CONTACTED,
        assignedToId: acmeEmployee1._id,
        createdById: acmeAdmin._id,
        comments: [
          {
            userId: acmeEmployee1._id,
            userName: "Mike Employee",
            comment: "Initial contact made, interested in our premium plan",
            createdAt: new Date(),
          },
        ],
      },
      {
        tenantId: acmeTenant._id,
        name: "Carol White",
        email: "carol@startupco.com",
        phone: "+1-555-0103",
        company: "StartupCo",
        source: LeadSource.COLD_CALL,
        status: LeadStatus.INTERESTED,
        assignedToId: acmeEmployee2._id,
        createdById: acmeAdmin._id,
        followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        comments: [
          {
            userId: acmeEmployee2._id,
            userName: "Lisa Employee",
            comment: "Very interested, scheduled demo for next week",
            createdAt: new Date(),
          },
        ],
      },
      {
        tenantId: acmeTenant._id,
        name: "David Brown",
        email: "david@enterprise.com",
        phone: "+1-555-0104",
        company: "Enterprise Ltd",
        source: LeadSource.EMAIL_CAMPAIGN,
        status: LeadStatus.CLOSED_WON,
        assignedToId: acmeEmployee1._id,
        createdById: acmeAdmin._id,
        comments: [
          {
            userId: acmeEmployee1._id,
            userName: "Mike Employee",
            comment: "Deal closed! Signed for annual subscription",
            createdAt: new Date(),
          },
        ],
      },
      {
        tenantId: acmeTenant._id,
        name: "Emma Davis",
        email: "emma@smallbiz.com",
        phone: "+1-555-0105",
        company: "Small Business Co",
        source: LeadSource.SOCIAL_MEDIA,
        status: LeadStatus.NEW,
        assignedToId: acmeEmployee2._id,
        createdById: acmeAdmin._id,
        comments: [],
      },
    ];

    await Lead.insertMany(acmeLeads);

    // Create Demo Tenant 2: TechCo
    console.log("🏢 Creating TechCo tenant...");
    const techcoTenant = await Tenant.create({
      name: "TechCo Industries",
      domain: "techco.com",
      plan: TenantPlan.BASIC,
      status: TenantStatus.ACTIVE,
      maxUsers: 20,
    });

    // Create TechCo Admin
    console.log("👤 Creating TechCo users...");
    const techcoAdmin = await User.create({
      tenantId: techcoTenant._id,
      email: "admin@techco.com",
      password: await hashPassword("admin123"),
      name: "Jane Admin",
      role: UserRole.ADMIN,
      isActive: true,
    });

    // Create TechCo Employee
    const techcoEmployee = await User.create({
      tenantId: techcoTenant._id,
      email: "employee@techco.com",
      password: await hashPassword("employee123"),
      name: "Tom Employee",
      role: UserRole.EMPLOYEE,
      isActive: true,
    });

    // Create Leads for TechCo
    console.log("📋 Creating leads for TechCo...");
    const techcoLeads = [
      {
        tenantId: techcoTenant._id,
        name: "Frank Wilson",
        email: "frank@example.com",
        phone: "+1-555-0201",
        company: "Example Corp",
        source: LeadSource.WEBSITE,
        status: LeadStatus.NEW,
        assignedToId: techcoEmployee._id,
        createdById: techcoAdmin._id,
        comments: [],
      },
      {
        tenantId: techcoTenant._id,
        name: "Grace Lee",
        email: "grace@demo.com",
        phone: "+1-555-0202",
        company: "Demo Inc",
        source: LeadSource.REFERRAL,
        status: LeadStatus.CONTACTED,
        assignedToId: techcoEmployee._id,
        createdById: techcoAdmin._id,
        comments: [],
      },
    ];

    await Lead.insertMany(techcoLeads);

    console.log("\n✨ Seed completed successfully!\n");
    console.log("=".repeat(60));
    console.log("📧 Login Credentials:");
    console.log("=".repeat(60));
    console.log("\n🔹 SaaS Admin:");
    console.log("   Email: admin@lmsplatform.com");
    console.log("   Password: admin123");
    console.log("\n🔹 Acme Corp (Company Admin):");
    console.log("   Email: admin@acme.com");
    console.log("   Password: admin123");
    console.log("\n🔹 Acme Corp (Manager):");
    console.log("   Email: manager@acme.com");
    console.log("   Password: manager123");
    console.log("\n🔹 Acme Corp (Employee 1):");
    console.log("   Email: employee1@acme.com");
    console.log("   Password: employee123");
    console.log("\n🔹 Acme Corp (Employee 2):");
    console.log("   Email: employee2@acme.com");
    console.log("   Password: employee123");
    console.log("\n🔹 TechCo (Company Admin):");
    console.log("   Email: admin@techco.com");
    console.log("   Password: admin123");
    console.log("\n🔹 TechCo (Employee):");
    console.log("   Email: employee@techco.com");
    console.log("   Password: employee123");
    console.log("\n" + "=".repeat(60) + "\n");

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();

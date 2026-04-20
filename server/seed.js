import mongoose from "mongoose";
import dotenv from "dotenv";
import Availability from "./models/Availability.model.js";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

dotenv.config();

import Resource from "./models/Resource.model.js";
import User from "./models/User.model.js";
import bcrypt from "bcryptjs";

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    family: 4,
  });
  console.log("MongoDB connected for seeding");
};

const seed = async () => {
  await connectDB();

  // Clear existing data
  await Resource.deleteMany({});
  await User.deleteMany({});
  console.log("Cleared existing data");

  // Create admin user
  const adminHash = await bcrypt.hash("admin123", 12);
  const admin = await User.create({
    name: "Admin User",
    email: "admin@mindmap.com",
    passwordHash: adminHash,
    role: "admin",
    isVerified: true,
  });

  // Create regular user
  const userHash = await bcrypt.hash("user123", 12);
  const user = await User.create({
    name: "Test User",
    email: "user@mindmap.com",
    passwordHash: userHash,
    role: "user",
    isVerified: true,
  });

  console.log("Created users");

  // Seed resources across India
  const resources = [
    // Delhi
    {
      name: "iCall — TISS Mental Health",
      type: "hotline",
      address: "Tata Institute of Social Sciences, Delhi",
      phone: "9152987821",
      website: "https://icallhelpline.org",
      description: "Free psychological counselling by trained counsellors and psychologists.",
      languages: ["English", "Hindi"],
      tags: ["counselling", "free", "students", "adults"],
      location: { type: "Point", coordinates: [77.2090, 28.6139] },
      isVerified: true,
      addedBy: admin._id,
      avgRating: 4.5,
    },
    {
      name: "Vandrevala Foundation Helpline",
      type: "hotline",
      address: "Pan India — 24/7 Helpline",
      phone: "1860-2662-345",
      website: "https://www.vandrevalafoundation.com",
      description: "24/7 free mental health support helpline available across India.",
      languages: ["English", "Hindi"],
      tags: ["24/7", "crisis", "free", "helpline"],
      location: { type: "Point", coordinates: [77.1025, 28.7041] },
      isVerified: true,
      addedBy: admin._id,
      avgRating: 4.2,
    },
    {
      name: "NIMHANS Outpatient Services",
      type: "hospital",
      address: "Hosur Road, Bengaluru, Karnataka 560029",
      phone: "080-46110007",
      website: "https://nimhans.ac.in",
      description: "India's premier mental health institute offering comprehensive psychiatric care.",
      languages: ["English", "Hindi", "Kannada"],
      tags: ["psychiatry", "inpatient", "outpatient", "research"],
      location: { type: "Point", coordinates: [77.5946, 12.9292] },
      isVerified: true,
      addedBy: admin._id,
      avgRating: 4.7,
    },
    {
      name: "The Mind Clan",
      type: "online",
      address: "Online — Pan India",
      website: "https://themindclan.com",
      description: "Find therapists, read mental health content, and access online resources.",
      languages: ["English"],
      tags: ["online", "therapy", "directory", "self-help"],
      location: { type: "Point", coordinates: [72.8777, 19.0760] },
      isVerified: true,
      addedBy: admin._id,
      avgRating: 4.3,
    },
    {
      name: "Snehi NGO",
      type: "ngo",
      address: "C-55, South Extension Part 2, New Delhi 110049",
      phone: "91-22-2772-6771",
      website: "https://snehi.org",
      description: "Emotional support and suicide prevention NGO with trained volunteers.",
      languages: ["English", "Hindi"],
      tags: ["suicide prevention", "emotional support", "volunteers", "free"],
      location: { type: "Point", coordinates: [77.2167, 28.5672] },
      isVerified: true,
      addedBy: admin._id,
      avgRating: 4.4,
    },
    // Mumbai
    {
      name: "Aasra Crisis Helpline",
      type: "hotline",
      address: "Mumbai, Maharashtra",
      phone: "9820466627",
      website: "https://www.aasra.info",
      description: "24/7 crisis intervention helpline for those in emotional distress.",
      languages: ["English", "Hindi"],
      tags: ["crisis", "suicide prevention", "24/7", "free"],
      location: { type: "Point", coordinates: [72.8777, 19.0760] },
      isVerified: true,
      addedBy: admin._id,
      avgRating: 4.6,
    },
    {
      name: "KEM Hospital Psychiatry",
      type: "hospital",
      address: "Acharya Donde Marg, Parel, Mumbai 400012",
      phone: "022-24107000",
      description: "Government hospital with dedicated psychiatry department and outpatient services.",
      languages: ["English", "Hindi", "Marathi"],
      tags: ["government", "affordable", "psychiatry", "outpatient"],
      location: { type: "Point", coordinates: [72.8397, 19.0020] },
      isVerified: true,
      addedBy: admin._id,
      avgRating: 3.9,
    },
    // Bangalore
    {
      name: "Sangath Community Mental Health",
      type: "ngo",
      address: "Indiranagar, Bengaluru, Karnataka",
      website: "https://sangath.in",
      description: "NGO scaling mental health care through community health workers and tech.",
      languages: ["English", "Hindi", "Kannada"],
      tags: ["community", "affordable", "research-backed", "ngo"],
      location: { type: "Point", coordinates: [77.6412, 12.9784] },
      isVerified: true,
      addedBy: admin._id,
      avgRating: 4.5,
    },
    // Chennai
    {
      name: "Schizophrenia Research Foundation",
      type: "ngo",
      address: "R/7A, North Main Road, Anna Nagar West, Chennai 600101",
      phone: "044-26142922",
      website: "https://scarfindia.org",
      description: "Mental health care, rehabilitation and community services in Tamil Nadu.",
      languages: ["English", "Tamil"],
      tags: ["schizophrenia", "rehabilitation", "community", "affordable"],
      location: { type: "Point", coordinates: [80.2101, 13.0827] },
      isVerified: true,
      addedBy: admin._id,
      avgRating: 4.3,
    },
    // Hyderabad
    {
      name: "Medvarsity Online Therapy",
      type: "online",
      address: "Online — Pan India",
      website: "https://www.medvarsity.com",
      description: "Online mental health consultations with licensed therapists and psychiatrists.",
      languages: ["English", "Hindi", "Telugu"],
      tags: ["online", "therapy", "psychiatry", "affordable"],
      location: { type: "Point", coordinates: [78.4867, 17.3850] },
      isVerified: true,
      addedBy: admin._id,
      avgRating: 4.1,
    },
    // Amritsar / Punjab
    {
      name: "Government Medical College Psychiatry — Amritsar",
      type: "hospital",
      address: "G.T. Road, Majitha Verka, Amritsar, Punjab 143001",
      phone: "0183-2424598",
      description: "Government medical college with psychiatry department serving Punjab region.",
      languages: ["English", "Hindi", "Punjabi"],
      tags: ["government", "free", "psychiatry", "punjab"],
      location: { type: "Point", coordinates: [74.8723, 31.6340] },
      isVerified: true,
      addedBy: admin._id,
      avgRating: 3.8,
    },
    {
      name: "Mind Matters Counselling — Amritsar",
      type: "therapist",
      address: "Lawrence Road, Amritsar, Punjab",
      phone: "98765-43210",
      description: "Private counselling centre offering individual, couples and family therapy.",
      languages: ["English", "Hindi", "Punjabi"],
      tags: ["counselling", "private", "therapy", "punjab"],
      location: { type: "Point", coordinates: [74.8600, 31.6200] },
      isVerified: true,
      addedBy: admin._id,
      avgRating: 4.4,
    },
    // Kolkata
    {
      name: "Institute of Psychiatry — Kolkata",
      type: "hospital",
      address: "7, D.H. Road, Kolkata, West Bengal 700025",
      phone: "033-24192219",
      description: "Premier psychiatric institute in eastern India with inpatient and outpatient care.",
      languages: ["English", "Hindi", "Bengali"],
      tags: ["government", "inpatient", "outpatient", "affordable"],
      location: { type: "Point", coordinates: [88.3639, 22.5726] },
      isVerified: true,
      addedBy: admin._id,
      avgRating: 4.2,
    },
    // Pune
    {
      name: "Mpower — The Centre",
      type: "therapist",
      address: "Koregaon Park, Pune, Maharashtra 411001",
      phone: "1800-120-820050",
      website: "https://mpowerminds.com",
      description: "Comprehensive mental health centre with therapy, psychiatry and support groups.",
      languages: ["English", "Hindi", "Marathi"],
      tags: ["therapy", "psychiatry", "support groups", "comprehensive"],
      location: { type: "Point", coordinates: [73.8930, 18.5362] },
      isVerified: true,
      addedBy: admin._id,
      avgRating: 4.6,
    },
    // Online / National
    {
      name: "YourDOST Online Counselling",
      type: "online",
      address: "Online — Pan India",
      website: "https://yourdost.com",
      description: "Online emotional wellness platform with experts available via chat and video.",
      languages: ["English", "Hindi"],
      tags: ["online", "chat", "video", "affordable", "students"],
      location: { type: "Point", coordinates: [77.5946, 12.9716] },
      isVerified: true,
      addedBy: admin._id,
      avgRating: 4.0,
    },
  ];

  const indianInsurances = ["Star Health", "HDFC ERGO", "ICICI Lombard", "Niva Bupa", "Care Health"];
  resources.forEach(r => {
    if (r.type === "ngo" || r.type === "hotline") {
      r.isFree = true;
      r.costPerSession = 0;
      r.insuranceAccepted = [];
    } else {
      r.isFree = false;
      r.costPerSession = Math.floor(Math.random() * 2000) + 1000;
      const shuffled = [...indianInsurances].sort(() => 0.5 - Math.random());
      r.insuranceAccepted = shuffled.slice(0, 2);
    }
  });

  await Resource.insertMany(resources);
  console.log(`Seeded ${resources.length} resources`);

  console.log("\n--- SEED COMPLETE ---");
  console.log("Admin login: admin@mindmap.com / admin123");
  console.log("User login:  user@mindmap.com  / user123");
  console.log("---------------------\n");

  // Seed availability for therapist + hospital resources
  const therapistResources = await Resource.find({ type: { $in: ["therapist", "hospital"] } });
  const workingHours = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

  for (const r of therapistResources) {
    await Availability.findOneAndUpdate(
      { resourceId: r._id },
      {
        weeklySlots: {
          mon: workingHours, tue: workingHours,
          wed: workingHours, thu: workingHours,
          fri: workingHours, sat: ["10:00", "11:00", "12:00"],
          sun: [],
        },
        slotDuration: 60,
        bookedSlots: [],
      },
      { upsert: true }
    );
  }
  console.log("Seeded availability for", therapistResources.length, "resources");

  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
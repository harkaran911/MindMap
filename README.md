# MindMap 🧠🌍

MindMap is a full-stack, real-world deployment-ready telehealth scaling platform built to securely connect patients with verified mental health resources (Hospitals, NGOS, Therapists, Hotlines) via a dynamic, map-based interface.

Designed around patient affordability, anonymity, and immediate clinical access, MindMap is heavily fortified with enterprise-grade networking and strict encryption layers to ensure HIPAA compliance and absolute data privacy.

---

## 🚀 Key Features

* **Real-time Telehealth Infrastructure (WebRTC)**: A custom native `RTCPeerConnection` integration using Google STUN networks allowing verified Providers and patients to instantly jump into P2P 1-on-1 Video and Audio calls without external plugin dependencies.
* **Database-Level Cryptography (HIPAA-prep)**: All sensitive patient appointment data and "reason for visit" notes are dynamically encrypted at rest within MongoDB using AES-256-CTR symmetric ciphers. Data leakage is mathematically mitigated. 
* **Global SOS & Quick Escape**: Patients actively in distress can utilize the persistent global SOS widget to access crisis lines, featuring a "Quick Escape" function that instantaneously flushes the history state and redirects to Google.
* **Affordability Engine & Insurance Matching**: Allows patients to aggressively filter resources based on actual clinical cost metrics (`costPerSession`), limiting searches to purely "Free/NGO" providers or validating specific Indian baseline Insurance Networks.
* **Anonymous Verification Layer**: Users can submit community reviews regarding therapists with a strict anonymity toggle, masking their identity within internal memory payloads to avoid API surveillance.
* **Concurrency Locking**: Atomic database transactions guarantee that an open clinical slot can never be double-booked by simultaneous patients.

---

## 💻 Technology Stack

* **Frontend**: React 18 (Vite), TailwindCSS, Lucide-React, React-Router
* **State & Data Handling**: `@tanstack/react-query`, Zustand (Auth)
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose ODMs)
* **Real-Time Data Broker**: Socket.IO (Signaling parameters)
* **Network Security**: Helmet, express-rate-limit, express-mongo-sanitize, xss-clean

---

## 🛠️ Usage

This project is separated into a `client` (Vite React application) and `server` (Node.js API).

**1. Clone the repository**
```bash
git clone https://github.com/harkaran911/MindMap.git
cd MindMap
```

**2. Install dependencies & Run Backend**
```bash
cd server
npm install
npm run dev
```

*(Note: If testing for the first time, you can execute `npm run seed` within the server directory to inject dummy therapist data and admin accounts)*

**3. Install dependencies & Run Frontend (In a second terminal)**
```bash
cd client
npm install
npm run dev
```

---

## 🔐 Default Sandbox Credentials

If the database is freshly seeded, you can utilize these default testing accounts:

**Admin Account:**
* Email: `admin@mindmap.com`
* Password: `admin123`

**Standard User:**
* Email: `user@mindmap.com`
* Password: `user123`

---

*Securing digital architecture for those who need it most.*

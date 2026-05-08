# 🍔 UnityEats — The Ultimate Shared Feast

UnityEats is a high-fidelity, real-time food delivery platform designed for group ordering. It allows multiple users to contribute to a single cart, synchronize their locations, and track their collective feast from the kitchen to their doorstep.

---

## 🚀 Key Features

*   **Real-Time Shared Carts**: Invite friends via a unique link to add items to a group order simultaneously using Socket.IO.
*   **Location Synchronization**: Lock a shared delivery destination on a map to ensure everyone is ordering to the same spot.
*   **Live Order Tracking**: A synchronized countdown timer and progress bar for all participants once an order is placed.
*   **Dual Payment Support**: Integrated with **Stripe** for digital payments and **Cash on Delivery (COD)**.
*   **Admin Dashboard**: Manage restaurants, curate menus, and monitor platform activity.
*   **Fully Responsive**: Premium UI designed for Mobile, Tablet, and Desktop.

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js 14, Tailwind CSS, Lucide Icons, Socket.IO Client.
*   **Backend**: Node.js, Express, Prisma ORM, Socket.IO.
*   **Database**: PostgreSQL (Production) / SQLite (Development).
*   **Payments**: Stripe API.

---

## 📦 Getting Started

### 1. Prerequisites
*   **Node.js** (v18 or higher)
*   **npm** or **yarn**
*   **Stripe Account** (for API keys)

### 2. Backend Setup
```bash
cd backend
npm install

# Set up your .env file
# DATABASE_URL="postgresql://user:password@localhost:5432/unityeats"
# STRIPE_SECRET_KEY="sk_test_..."
# FRONTEND_URL="http://localhost:3000"
# SESSION_SECRET="your-secret"

# Initialize Database
npx prisma generate
npx prisma db push
npx prisma db seed # Populates sample restaurants and menu items

# Start Server
npm run dev # Running on http://localhost:4000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Set up your .env file
# NEXT_PUBLIC_API_URL="http://localhost:4000/api"

# Start App
npm run dev # Running on http://localhost:3000
```

---

## 🔐 Admin Access

To access the Admin Dashboard (`/admin`), use the following credentials:

*   **Email**: `admin@example.com`
*   **Password**: `admin123`

*(To create a new admin, run `npx tsx src/scripts/create-admin.ts` in the backend folder)*

---

## 📱 Running on Mobile / Other Devices

To test the real-time sharing features on your phone:
1.  Ensure your device is on the same Wi-Fi as your computer.
2.  Use a tool like **ngrok** to tunnel your local servers:
    ```bash
    ngrok http 3000 # For Frontend
    ngrok http 4000 # For Backend
    ```
3.  Update the `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` in your `.env` files with the ngrok links.

---

## 📄 License
MIT License. Built with ❤️ for the UnityEats community.

# 📦 Delivery System – Backend API

A secure and scalable parcel delivery backend built with **Express**, **TypeScript**, and **MongoDB**. Inspired by services like Pathao Courier and Sundarban, this system supports role-based access for `admin`, `sender`, and `receiver`, with full parcel tracking and status history.

---

## 🚀 Tech Stack

- **Express.js** – Web framework
- **TypeScript** – Type-safe development
- **Mongoose** – MongoDB ODM
- **JWT Token** – Authentication
- **Zod** – Request validation
- **cookie-parser** – Cookie handling
- **CORS** – Cross-origin resource sharing
- **bcrypt** – Password hashing
- **nodemailer** – email sending
- **redis** – otp send & verify

---

**
---

## 🔐 Authentication & Roles

- JWT-based login system
- Roles: `admin`, `sender`, `receiver`
- Role-based route protection via middleware

---

## 📦 Parcel Features

- Create parcel requests (sender or admin)
- View parcel status logs (sender/receiver)
- Confirm delivery (receiver)
- Embedded status history inside parcel model
- Unique tracking ID format: `TRK-YYYYMMDD-xxxxxx`

---

## ✅ Validation

- All incoming requests validated via **Zod**
- Status logs follow strict schema
- Only authorized users can update parcel status

---

## 🧑‍💼 Admin Access & Controls

Admins have full access to system data and can:

- View all users and their status
- View all parcels and their status
- View and update payment status
- Update parcel status logs (approved, dispatched, in-transit, delivered)
- Delete parcels

## 📡 API Reference

APIs == liveLink/api/v1/

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/` | Create a parcel delivery request | `admin`, `sender` |
| `GET`  | `/all-parcel` | Get all parcels in the system | `admin` |
| `PATCH`| `/confirm` | Confirm a parcel by receiver (via email or phone) | `receiver` |
| `GET`  | `/receiver` | Get all incoming parcels for a receiver | `receiver` |
| `GET`  | `/myParcels/:senderId` | Get all parcels requested by a sender | `admin`, `sender` |
| `GET`  | `/anyOne/:trackingId` | Get parcel details and status log by tracking ID | `public` |
| `DELETE`| `/:trackingId` | Delete a parcel by tracking ID | `admin` |
| `PATCH`| `/:parcelId` | Update parcel status log (approved, dispatched, in-transit, delivered) | `admin` |
| `POST` | `/send` | Send OTP to sender’s email for parcel cancellation | `sender` |
| `POST` | `/verify` | Verify OTP and cancel parcel if valid | `sender` |

---

## 🛠 Setup Instructions

```bash
# Clone the repo
git clone https://github.com/your-username/delivery-system-backend.git

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env

# Run the server
pnpm dev**

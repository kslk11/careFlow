# 🏥 CareFlow - Healthcare Management System

A comprehensive full-stack healthcare management platform connecting patients, doctors, and hospitals with integrated payment processing, appointment booking, referral management, and billing system.

![CareFlow Banner](https://via.placeholder.com/1200x300/06b6d4/ffffff?text=CareFlow+Healthcare+Management+System)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Payment Integration](#payment-integration)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

CareFlow is a modern healthcare management system that streamlines the entire patient journey from appointment booking to bill payment. The platform facilitates seamless communication between patients, doctors, and hospitals while automating administrative tasks.

### Key Highlights
- **3 User Roles**: Patient, Doctor, Hospital Admin
- **Real-time Updates**: Live appointment status, bed availability
- **Integrated Payments**: Razorpay payment gateway with EMI support
- **Smart Referral System**: Inter-hospital patient referrals
- **Automated Billing**: Dynamic bill generation with operation + bed charges
- **AI Chatbot**: Context-aware intelligent assistant
- **Review System**: Patient ratings and feedback for doctors/hospitals

---

## ✨ Features

### 👤 For Patients
- 📅 **Appointment Booking** with online payment
- 💊 **Book for Family Members** with separate profiles
- 📋 **View Medical History** and prescriptions
- 💳 **Online Bill Payment** with full/partial/EMI options
- ⭐ **Rate & Review** doctors and hospitals
- 🤖 **AI Chatbot** for quick assistance
- 📧 **Email Notifications** for appointments and payments

### 👨‍⚕️ For Doctors
- 📊 **Dashboard** with appointment overview
- ✅ **Approve/Reject** appointment requests
- 📝 **Digital Prescriptions** with diagnosis
- 🔄 **Refer Patients** to specialized hospitals
- 💬 **View Patient Reviews** and ratings
- 📈 **Performance Analytics**

### 🏥 For Hospitals
- 🛏️ **Bed Management** with real-time availability
- 🔧 **Operation Management** with pricing
- 📋 **Referral Processing** (accept/assign/complete)
- 💰 **Bill Generation** (operation + bed charges)
- 👥 **Staff Management** (doctors, departments)
- 📊 **Revenue Analytics** with 90/10 split
- ⚙️ **Department Management**

---

## 🛠️ Tech Stack

### Frontend
- **React.js** 18.x - UI framework
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation
- **Razorpay Checkout** - Payment UI

### Backend
- **Node.js** 18.x - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Node-Cron** - Scheduled tasks

### Payment & Notifications
- **Razorpay API** - Payment processing
- **Nodemailer** - Email service
- **Crypto** - Signature verification

### DevOps & Tools
- **Git** - Version control
- **Postman** - API testing
- **MongoDB Compass** - Database GUI

---

## 🏗️ System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Patient │  │  Doctor  │  │ Hospital │  │  Chatbot │   │
│  │Dashboard │  │Dashboard │  │Dashboard │  │   AI     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ (HTTPS/REST API)
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js + Express)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     Auth     │  │   Payment    │  │    Email     │     │
│  │  Middleware  │  │   Gateway    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Controllers │  │    Routes    │  │   Cron Jobs  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ (MongoDB Driver)
┌─────────────────────────────────────────────────────────────┐
│                      Database (MongoDB)                      │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │Users │  │Doctors│ │Hospitals│ │Beds │  │Bills │         │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘         │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                   │
│  │Appts │  │Refer │  │Reviews│ │Operations│                │
│  └──────┘  └──────┘  └──────┘  └──────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Prerequisites

Before installation, ensure you have:

- **Node.js** 18.x or higher
- **MongoDB** 5.x or higher (local or Atlas)
- **npm** or **yarn** package manager
- **Razorpay Account** (for payments)
- **Gmail Account** (for email notifications)

---

## 🚀 Installation

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/careflow.git
cd careflow
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required `.env` variables:**
```env
# Server
PORT=8000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/careflow

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=https://careflow-lsf5.onrender.com
```

### 3. Frontend Setup
```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Start Backend
```bash
# In backend directory
npm start

# Or with nodemon (auto-restart)
npm run dev
```

### 5. Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** https://careflow-lsf5.onrender.com
- **API Docs:** https://careflow-lsf5.onrender.com/api-docs (if implemented)

---

## ⚙️ Configuration

### Email Configuration (Gmail)

1. Enable 2-Factor Authentication in Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use generated password in `EMAIL_PASS`

### Razorpay Configuration

1. Sign up at https://razorpay.com
2. Get Test API Keys from Dashboard
3. Add to `.env` file
4. For live mode, complete KYC and use live keys

### MongoDB Configuration

**Local MongoDB:**
```env
MONGO_URI=mongodb://localhost:27017/careflow
```

**MongoDB Atlas:**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/careflow
```

---

## 📖 Usage

### Patient Workflow

1. **Register/Login** → Patient dashboard
2. **Browse Hospitals** → View doctors
3. **Book Appointment** → Select date/time → Pay consultation fee
4. **Wait for Approval** → Doctor approves/rejects
5. **Complete Appointment** → Rate doctor
6. **View Bills** → Pay online (full/partial/EMI)

### Doctor Workflow

1. **Login** → Doctor dashboard
2. **View Appointments** → Approve/reject requests
3. **Create Prescription** → Add diagnosis & medicines
4. **Refer Patient** (if needed) → Select hospital & operation
5. **View Reviews** → Monitor ratings

### Hospital Workflow

1. **Login** → Hospital dashboard
2. **Manage Beds** → Add/update availability
3. **Process Referrals** → Accept → Assign bed
4. **Complete Referral** → Generate bill
5. **Monitor Revenue** → View analytics

---

## 🔌 API Documentation

### Authentication
```http
POST /api/user/register
POST /api/user/login
POST /api/doctor/register
POST /api/doctor/login
POST /api/hospital/register
POST /api/hospital/login
```

### Appointments
```http
POST   /api/appointment-payment/create-order
POST   /api/appointment-payment/verify
GET    /api/appointment/user
PUT    /api/appointment/:id/approve
PUT    /api/appointment/:id/reject
```

### Payments
```http
POST   /api/payment/create-order
POST   /api/payment/verify
POST   /api/payment/failure
GET    /api/payment/history/:billId
```

### Referrals
```http
POST   /api/refer/create
GET    /api/refer/hospital/:hospitalId
PUT    /api/refer/:id/accept
PUT    /api/refer/:id/assign-bed
PUT    /api/refer/:id/complete
```

### Reviews
```http
POST   /api/review/doctor
GET    /api/review/doctor/:doctorId
POST   /api/review/hospital
GET    /api/review/hospital/:hospitalId
GET    /api/review/user/mine
```

**Full API Documentation:** [API_DOCS.md](./docs/API_DOCS.md)

---

## 💾 Database Schema

### Core Collections

**Users**
```javascript
{
  name, email, password, phone, address,
  role: 'patient',
  createdAt, updatedAt
}
```

**Doctors**
```javascript
{
  name, email, password, specialization,
  hospitalId, consultationFee, ratings,
  createdAt, updatedAt
}
```

**Hospitals**
```javascript
{
  name, email, password, address, phone,
  facilities, ratings, departments,
  createdAt, updatedAt
}
```

**Appointments**
```javascript
{
  userId, doctorId, hospitalId,
  appointmentDate, appointmentTime,
  status, paymentStatus, consultationFee,
  razorpayOrderId, razorpayPaymentId,
  createdAt, updatedAt
}
```

**Bills**
```javascript
{
  hospitalId, patientName, patientPhone,
  billNumber, items[], totalAmount,
  amountPaid, paymentStatus, paymentHistory[],
  referralId, operationDetails, bedDetails,
  createdAt, updatedAt
}
```

**Referrals**
```javascript
{
  referringDoctorId, hospitalId, operationId,
  patientName, patientPhone,
  status, bedId, assignedDate, dischargeDate,
  createdAt, updatedAt
}
```

**Full Schema:** [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)

---

## 💳 Payment Integration

### Razorpay Integration

**Test Mode:**
- Test Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- OTP: Any 6 digits

**Live Mode:**
- Complete KYC
- Add bank account
- Use live API keys
- 2% + GST transaction fee

### Payment Flow
```
User clicks "Pay" → Backend creates Razorpay order
→ Frontend opens Razorpay checkout → User completes payment
→ Razorpay sends response → Backend verifies signature
→ Update bill/appointment status → Send email receipt
```

### Supported Payment Methods
- Credit/Debit Cards
- UPI (PhonePe, GPay, Paytm)
- Net Banking
- Wallets
- EMI (2 or 3 installments)

---

## 📸 Screenshots

### Patient Dashboard
![Patient Dashboard](./screenshots/patient-dashboard.png)

### Doctor Dashboard
![Doctor Dashboard](./screenshots/doctor-dashboard.png)

### Hospital Dashboard
![Hospital Dashboard](./screenshots/hospital-dashboard.png)

### Payment Gateway
![Payment](./screenshots/payment-gateway.png)

### Chatbot
![Chatbot](./screenshots/chatbot.png)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

---

## 👥 Team

- **Developer:** Kaushal kumar
- **Email:** kaushalmahawer267@gmail.com
- **LinkedIn:** https://www.linkedin.com/in/kaushal-kumar11/
- **GitHub:** https://github.com/kslk11

---

## 🙏 Acknowledgments

- Razorpay for payment gateway
- MongoDB for database
- React community
- All contributors

---

## 📞 Support

For support, email support@careflow.com or join our Slack channel.

---

**Made with ❤️ by CareFlow Team**
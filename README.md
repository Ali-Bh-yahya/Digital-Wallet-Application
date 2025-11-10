# 💳 Digital Wallet Application

A full-stack digital wallet application with virtual card generation, secure transactions, and admin approval system.

![Wallet App](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

## ✨ Features

### User Features
- 🔐 **Secure Authentication** - JWT-based authentication with cookie sessions
- 💰 **Wallet Management** - Deposit, withdraw, and transfer funds
- 💳 **Virtual Card** - Auto-generated virtual Visa card with encrypted CVV
- 📊 **Transaction History** - Complete transaction tracking
- 🔒 **Password-Protected CVV** - Re-authentication required to reveal CVV
- 📱 **Responsive Design** - Modern UI that works on all devices

### Admin Features
- 👥 **User Management** - Approve, reject, suspend, or delete users
- 📋 **Application Review** - View user ID cards and documents
- 📊 **User Dashboard** - Monitor pending, active, and suspended users
- 🎫 **Automatic Card Generation** - Virtual cards created upon user approval

## 🚀 Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **CSS3** - Modern styling with animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File uploads
- **AES-256-CBC** - CVV encryption

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/wallet-app.git
cd wallet-app
```

### 2. Backend Setup
```bash
cd wallet-backend
npm install
```

Create `.env` file in the backend directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/wallet-app
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/wallet-app

JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
SECRET_KEY=your_encryption_key_here_minimum_32_characters
NODE_ENV=development
```

Create `uploads/` folder:
```bash
mkdir uploads
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../wallet-client
npm install
```

Create `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

## 📁 Project Structure
```
wallet-app/
├── wallet-backend/
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── auth.controller.js
│   │   └── wallet.controller.js
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── authenticateAdmin.js
│   │   └── upload.js
│   ├── models/
│   │   ├── transaction.model.js
│   │   └── wallet.models.js
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   └── wallet.routes.js
│   ├── utils/
│   │   └── encryption.js
│   ├── uploads/
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── wallet-client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── VirtualCardDisplay.jsx
│   │   │   ├── PendingApproval.jsx
│   │   │   ├── RequireAuth.jsx
│   │   │   └── RequireAdmin.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── styles/
│   │   │   ├── AdminDashboard.css
│   │   │   ├── AuthModal.css
│   │   │   ├── LandingPage.css
│   │   │   ├── PendingApproval.css
│   │   │   ├── UserDashboard.css
│   │   │   └── VirtualCard.css
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
│
└── README.md
```

## 🎯 Usage

### For Users

1. **Register** - Sign up with your details and upload ID card
2. **Wait for Approval** - Admin reviews your application
3. **Login** - Access your dashboard after approval
4. **Manage Wallet** - Deposit, withdraw, or transfer funds
5. **Use Virtual Card** - View your auto-generated virtual card

### For Admins

1. **Login** - Use admin credentials
2. **Review Applications** - Check pending user registrations
3. **Approve/Reject** - Review ID cards and approve/reject users
4. **Manage Users** - Suspend or delete existing users

### Default Admin Account
```
Email: admin@wallet.com
Password: admin123
```

**⚠️ IMPORTANT: Change admin credentials in production!**

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT authentication with HTTP-only cookies
- ✅ AES-256-CBC encryption for CVV
- ✅ Password re-authentication for CVV reveal
- ✅ File upload validation (5MB limit, images/PDF only)
- ✅ MongoDB injection protection
- ✅ CORS configuration
- ✅ Input validation and sanitization

## 🎨 Screenshots

### Landing Page
<img width="1899" height="1068" alt="Screenshot 2025-11-10 233527" src="https://github.com/user-attachments/assets/4d175f4b-05ea-47d0-9b3a-7fceddb08b5e" />


### User Dashboard
 <img width="1781" height="907" alt="Screenshot 2025-11-10 234137" src="https://github.com/user-attachments/assets/f4a24de3-92f5-48d7-aec8-60d37fa2ce7f" />


### Virtual Card
<img width="1066" height="809" alt="Screenshot 2025-11-10 234254" src="https://github.com/user-attachments/assets/a6e9f80e-c014-478c-9166-22f3decce324" />


### Admin Panel
<img width="659" height="829" alt="Screenshot 2025-11-10 234408" src="https://github.com/user-attachments/assets/971cf722-aae6-41c2-b46c-b3aaf3e20cbf" />


## 🧪 Testing

### Test User Registration
```bash
# Backend must be running
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: multipart/form-data" \
  -F "name=Test User" \
  -F "email=test@example.com" \
  -F "password=password123" \
  -F "phone=1234567890" \
  -F "idNumber=123456789" \
  -F "idCardImage=@/path/to/id.jpg"
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# If using Atlas, verify:
# 1. IP whitelist includes your IP (or 0.0.0.0/0 for development)
# 2. Database user has correct permissions
# 3. Connection string is correct in .env
```

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### CORS Errors
Make sure your backend `server.js` has:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

## 📝 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: multipart/form-data

Fields:
- name: string
- email: string
- password: string
- phone: string
- idNumber: string
- idCardImage: file
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Logout
```http
POST /api/auth/logout
```

### Wallet Endpoints (Authenticated)

#### Get Wallet Info
```http
GET /api/wallet/info
```

#### Deposit
```http
POST /api/wallet/deposit
Content-Type: application/json

{
  "amount": 100,
  "description": "Deposit description"
}
```

#### Withdraw
```http
POST /api/wallet/withdraw
Content-Type: application/json

{
  "amount": 50,
  "description": "Withdrawal description"
}
```

#### Transfer
```http
POST /api/wallet/transfer
Content-Type: application/json

{
  "amount": 25,
  "toUserId": "recipient_user_id",
  "description": "Transfer description"
}
```

#### Reveal CVV
```http
POST /api/wallet/reveal-cvv
Content-Type: application/json

{
  "password": "user_password"
}
```

#### Get Transactions
```http
GET /api/wallet/transactions
```

### Admin Endpoints (Admin Only)

#### Get Pending Users
```http
GET /api/admin/pending-users
```

#### Get Active Users
```http
GET /api/admin/active-users
```

#### Get Suspended Users
```http
GET /api/admin/suspended-users
```

#### Approve User
```http
PATCH /api/admin/approve/:userId
```

#### Reject User
```http
PATCH /api/admin/reject/:userId
```

#### Suspend User
```http
PATCH /api/admin/suspend/:userId
```

#### Unsuspend User
```http
PATCH /api/admin/unsuspend/:userId
```

#### Delete User
```http
DELETE /api/admin/user/:userId
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



## 👨‍💻 Author

**Your Name**
- GitHub: [Ali-Bh-yahya]([https://github.com/yourusername](https://github.com/Ali-Bh-yahya))
- LinkedIn: [Alı Yahya](www.linkedin.com/in/ali-yahya999)
- Email: your.email@example.com

## 🙏 Acknowledgments

- React team for the amazing library
- MongoDB team for the database
- All contributors who helped with this project

## 📞 Support

For support,  ali.bahayahya@gmail.com
---

⭐ If you found this project helpful, please give it a star!


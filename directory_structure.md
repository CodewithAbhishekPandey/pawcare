# PawCare: Directory Architecture & File Map

PawCare is split into two independent folders: `server` (the Node.js/Express backend) and `client` (the React/Vite frontend). Here is a detailed breakdown of how the directory is planned and what exactly each file does.

---

## 🖥️ Backend (`/server`)
This folder contains the API, database schemas, and all the business logic for the platform.

### 1. `/models` (Database Schemas)
Defines how data is structured in MongoDB using Mongoose.
* `User.js`: Schema for all users (Pet Owners, Vets, Admins). Includes password hashing and role definitions.
* `Clinic.js`: Schema for physical vet clinics, tracking location, offline slots, and working hours.
* `Product.js`: Schema for e-commerce items (food, toys, medicine) including inventory stock.
* `Order.js`: Schema for tracking user purchases, delivery status, and assigned agents.
* `Appointment.js`: Schema for tracking offline, physical clinic bookings.
* `ConsultSession.js`: Schema for tracking online video teleconsultations and Razorpay payment status.
* `DeliveryAgent.js`: Schema tracking the delivery fleet and their assigned areas.
* `SiteSetting.js`: Schema for global platform variables (like toggling the shop on/off or setting platform fees).

### 2. `/controllers` (Business Logic)
This is the "brain" of the app. Functions here talk to the database and send responses back to the client.
* `authController.js`: Handles Registration, Login, and JWT generation.
* `orderController.js`: Handles checking out, verifying stock, and sending confirmation emails.
* `consult.controller.js`: Handles Razorpay payment generation and completing video sessions.
* `admin.controller.js`: A massive file containing all logic for the Admin Dashboard (banning users, assigning delivery agents, tracking platform revenue).
* `clinicController.js` & `vet.controller.js`: Handles fetching and filtering vets/clinics for the discovery pages.

### 3. `/routes` (API Endpoints)
Maps URL endpoints to the specific functions inside the controllers.
* `authRoutes.js`: Maps `POST /api/auth/login` to `authController.login`.
* `admin.routes.js`: Maps all `/api/admin/*` routes. Protected so only admins can use them.
* *(Other route files follow the same pattern for products, orders, clinics, etc.)*

### 4. `/middleware` (Request Interceptors)
Functions that run *before* the controller is reached.
* `auth.js`: Reads the JWT token from the user's cookies/headers to verify they are logged in before letting them access protected routes.
* `adminOnly.middleware.js`: Checks if the logged-in user has `role === 'admin'`. If not, it blocks the request.

### 5. `/socket` & `/utils`
* `socket/consultQueue.js`: Contains all the real-time Socket.io logic. It manages the digital "Waiting Room" and matches a pet owner with an available vet instantly.
* `utils/emailService.js`: Uses Nodemailer to send automated HTML emails to users when their order is placed or dispatched.

### 6. Root Server Files
* `index.js`: The main entry point. It connects to MongoDB, sets up Express, configures CORS, initializes Socket.io, and mounts all the routes.
* `seed.js`: A script that instantly populates an empty database with fake users, dummy products, and an Admin account so you don't have to start from scratch.

---

## 🎨 Frontend (`/client/src`)
This folder contains the React user interface, routing, and state management.

### 1. `/pages` (Main Application Views)
The primary screens that users navigate to.
* **E-Commerce**: `Shop.jsx` (Product catalog), `Cart.jsx` (Checkout), `Orders.jsx` (Customer order history).
* **Offline Vets**: `VetList.jsx` & `Clinics.jsx` (Discovery), `VetProfile.jsx` (Vet details), `BookAppointment.jsx` (Scheduling), `MyAppointments.jsx`.
* **Telemedicine**: `InstantConsult.jsx` (Landing page for online consults), `WaitingRoom.jsx` (Loading screen while Socket.io finds a vet), `VideoRoom.jsx` (The actual ZegoCloud video call interface).
* **Dashboards**: `OwnerDashboard.jsx` (Pet owner homepage), `VetDashboard.jsx` (Where vets accept incoming video calls and manage their schedule).

### 2. `/admin` (The Admin Panel)
A completely isolated sub-application for administrators to manage the platform.
* `AdminApp.jsx`: A sub-router that handles URLs starting with `/admin`.
* `AdminPrivateRoute.jsx`: A security wrapper that kicks out anyone who isn't an admin.
* `/layout`: Contains `AdminSidebar.jsx` (the dark navigation menu on the left) and `AdminTopbar.jsx`.
* `/pages`: Contains all the management tables (`ManageOrders.jsx`, `ManageUsers.jsx`, `ManageDeliveryAgents.jsx`, `SiteSettings.jsx`).

### 3. `/components` (Reusable UI Elements)
Small, isolated React components used across multiple pages.
* `Navbar.jsx`: The top navigation bar. It dynamically changes links based on whether you are logged in, and whether the Admin has enabled/disabled certain features.
* `ProductCard.jsx`: The visual card showing a product image, price, and an "Add to Cart" button.
* `VetCard.jsx` & `ConsultCard.jsx`: Reusable UI for displaying doctor profiles.

### 4. `/context` (Global State Management)
React Context providers that wrap the entire app to share data without passing props manually.
* `AuthContext.jsx`: Checks if the user is logged in upon website load. Provides `user` data and `login/logout` functions to any component that needs it.
* `CartContext.jsx`: Keeps track of what the user has added to their shopping cart. Saves cart data to `localStorage` so items aren't lost if the user refreshes the page.

### 5. `/api`
* `axios.js`: Pre-configures Axios to always point to `http://localhost:5000/api` and ensures that authentication cookies/tokens are automatically sent with every request.

### 6. Root Client Files
* `App.jsx`: The master React Router. It maps URLs (like `/shop`) to the corresponding Page components (like `<Shop />`).
* `main.jsx`: The entry point that mounts the React app to the HTML DOM.
* `index.css`: Where Tailwind CSS is imported and global CSS variables are defined.

# Welcome to PawCare! 🐾 (Developer Onboarding Guide)

Welcome to the team! This guide is written specifically for you, a developer joining the PawCare project. By the time you finish reading this, you will understand exactly what this application does, the technologies we use, the core logic (algorithms) running under the hood, and how the codebase is organized.

---

## 1. What is PawCare?

**PawCare** is an all-in-one pet healthcare and lifestyle platform. Think of it as three different apps merged into one:
1. **An E-commerce Store**: Pet owners can buy food, medicines, and toys.
2. **A Clinic Discovery Platform**: Users can find local offline veterinary clinics and book physical appointments.
3. **An On-Demand Telemedicine App**: Users can pay a fee to instantly join a real-time video call with an online vet.

---

## 2. Our Technology Stack (The MERN Stack + Extras)

We use the popular **MERN** stack, which means the entire application—both frontend and backend—is written in JavaScript.

### The Core MERN Stack:
*   **M (MongoDB)**: Our database. It's a NoSQL database, meaning we store data as JSON-like documents. We use a library called **Mongoose** to define schemas (blueprints) for our data.
*   **E (Express.js)**: A lightweight framework for our backend server. It handles our API routes (e.g., when the frontend asks for `GET /api/products`, Express handles it).
*   **R (React.js)**: Our frontend UI library. We use **Vite** as our build tool because it is blazingly fast. We style our components using **Tailwind CSS**.
*   **N (Node.js)**: The runtime environment that executes our backend JavaScript code.

### The "Extras" (Important Third-Party Tools):
*   **Socket.io**: Used for real-time, two-way communication. When a user requests an instant vet, Socket.io is what pings the available vets immediately without the user having to refresh the page.
*   **Razorpay**: Our payment gateway. We use it to securely process money when users pay for video consultations.
*   **ZegoCloud**: Our WebRTC video provider. It powers the actual 1-on-1 video and audio calls between vets and pet owners.
*   **Nodemailer**: Used on the backend to send automated emails (like "Order Confirmed" or "Order Cancelled").

---

## 3. Core Logic & "Algorithms" (How things work)

As a developer, you don't need to know complex machine-learning algorithms for this project. Instead, our "algorithms" are business logic workflows. Here are the three most important ones to understand:

### A. The Appointment Booking Logic (Offline Vets)
*   **The Problem**: Vets work specific hours (e.g., 9 AM to 5 PM) and see patients in intervals (e.g., every 30 minutes). How do we prevent double-booking?
*   **The Logic**: 
    1. When a vet registers their clinic, the server calculates their working hours and divides them into chunks based on their `slotInterval`. 
    2. These chunks become `availableSlots` saved to the database.
    3. When a user books a slot for a specific date, the backend creates an `Appointment` document.
    4. To prevent double-booking, the backend checks if an `Appointment` already exists for that `clinicId`, `date`, and `timeSlot`. If it does, the booking is rejected.

### B. The Instant Matchmaking Queue (Telemedicine)
*   **The Problem**: A user needs a vet *right now*. We need to find an available vet, take the user's money, and connect them in a video room.
*   **The Logic**:
    1. The user clicks "Consult Now". The backend creates a `ConsultSession` in the database with status `waiting`.
    2. The user pays via Razorpay. Once paid, the server changes the status to `paid`.
    3. The user is placed in a digital "Waiting Room". The frontend uses **Socket.io** to emit a `join_waiting_room` event.
    4. The backend broadcasts a `new_consult_request` event to all logged-in vets.
    5. The first vet to click "Accept" claims the session. The server updates the session with the vet's ID and changes the status to `in_call`.
    6. Both the user and the vet are redirected to a unique Video Room URL powered by **ZegoCloud**.

### C. E-Commerce Inventory & Cancellation Logic
*   **The Problem**: We must ensure users can't buy items that are out of stock, and we must return items to stock if an order is cancelled.
*   **The Logic**:
    1. During checkout, the server loops through the user's cart and checks the database: `if (product.stock < requestedQty)`, it throws an error.
    2. If successful, it creates the `Order` and *decrements* the stock: `product.stock -= qty`.
    3. If the user or admin clicks "Cancel Order", the server changes the order status to `cancelled` and *increments* the stock back: `product.stock += qty`.

---

## 4. Understanding the Codebase (Folder Structure)

The project is split into two main folders: `client` (Frontend) and `server` (Backend).

### The `server` folder (Backend)
*   `/models`: This is where database schemas live (e.g., `User.js`, `Product.js`). Look here to see what fields a database record has.
*   `/controllers`: This is the "brain" of the app. All the business logic (the algorithms mentioned above) lives here. E.g., `orderController.js` handles checkout.
*   `/routes`: This simply connects URLs to controllers. E.g., it tells the app that `POST /api/orders` should run the checkout logic.
*   `/middleware`: Functions that run *before* the controller. Most importantly, `auth.js` checks if a user is logged in by verifying their JWT (JSON Web Token).

### The `client` folder (Frontend)
*   `/src/pages`: These are the full-page views you see in the browser (e.g., `Home.jsx`, `Shop.jsx`, `Login.jsx`).
*   `/src/components`: Smaller, reusable pieces of UI (e.g., `Navbar.jsx`, `ProductCard.jsx`).
*   `/src/context`: React Context files used for global state management. E.g., `AuthContext.jsx` remembers who is logged in across the whole app, and `CartContext.jsx` remembers what is in the shopping cart.
*   `/src/admin`: An entirely separate section of the app meant only for administrators.

---

## 5. How to Run the App Locally

To start coding, you need both the backend and frontend running at the same time.

1.  Open your terminal and navigate to the backend: `cd server`
2.  Start the backend server: `npm run dev`
    *(It will run on port 5000 and connect to the database)*
3.  Open a **second** terminal and navigate to the frontend: `cd client`
4.  Start the frontend server: `npm run dev`
    *(It will give you a localhost URL, usually http://localhost:5173)*

### Test Accounts
You can log in to test different parts of the app using these pre-made accounts (Password for all is `Password123!`):
*   **Admin**: `admin@pawcare.in`
*   **Pet Owner**: `riya@pawcare.in`
*   **Vet**: `drpriya@pawcare.in`

---

**You're all set!** 🚀
Take some time to click around the app, explore the folder structure, and don't hesitate to ask questions. Happy coding!

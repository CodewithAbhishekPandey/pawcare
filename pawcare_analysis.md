## 1. PRODUCT OVERVIEW

* **Vision of PawCare**: [EXPLICIT] To be the premier all-in-one platform for pet healthcare, combining veterinary telemedicine, local clinic discovery, and an e-commerce storefront for pet essentials.
* **Target users (pet owners, vets, admins)**: 
  * [EXPLICIT] Pet Owners: Users seeking to buy pet food, book offline appointments, or join instant video consultations with vets.
  * [EXPLICIT] Vets: Medical professionals managing clinic schedules, joining on-demand teleconsults, and managing earnings.
  * [EXPLICIT] Admins: Platform administrators managing users, vets, product inventory, order fulfillment, delivery agents, and site-wide settings.
* **Core problem it solves**: [INFERRED] Fragmented pet care. Pet owners typically have to use separate platforms for buying supplies, finding local vets, and getting immediate medical advice. PawCare unifies these into a single, seamless digital experience.

---

## 2. COMPLETE TECH STACK (EXPLICIT + INFERRED)

**Frontend:**
* **Languages**: [EXPLICIT] JavaScript (ES6+), JSX
* **Frameworks**: [EXPLICIT] React (Vite)
* **UI libraries**: [EXPLICIT] Tailwind CSS (for styling), Recharts (for admin dashboard analytics), React Router DOM (for routing), Lucide React (for icons).

**Backend:**
* **Languages**: [EXPLICIT] Node.js
* **Frameworks**: [EXPLICIT] Express.js

**Database:**
* **Type**: [EXPLICIT] MongoDB (NoSQL)
* **DB choice reasoning**: [INFERRED] MongoDB is highly suited for e-commerce catalogs with varied product attributes and flexible document structures required for multi-role user systems (where pet owners and vets share a user collection but have vastly different nested data).

**Third-party integrations:**
* **Payment**: [EXPLICIT] Razorpay (for processing teleconsultation fees and future e-commerce prepaid orders).
* **Video consultation APIs**: [EXPLICIT] ZegoCloud (for WebRTC-based 1-on-1 real-time video calls).
* **Notification systems**: [EXPLICIT] Nodemailer (for automated transactional emails: order confirmations, agent assignments, cancellations).
* **Real-time Comms**: [EXPLICIT] Socket.io (for the real-time vet matchmaking queue and waiting room status updates).

---

## 3. FEATURE ARCHITECTURE

**A. E-commerce System**
* **Product listing**: [EXPLICIT] Searchable and filterable grid of pet supplies, categorized by type (food, medicine, equipment) and featured status.
* **Cart**: [EXPLICIT] Context-based state management (`CartContext`) allowing quantity adjustments and subtotal calculation before checkout.
* **Orders**: [EXPLICIT] Comprehensive order flow supporting Cash on Delivery (COD) and tracking. Includes soft-cancellations, refund tracking, and delivery agent assignment logic.

**B. Vet Consultation System**
* **Booking**: [EXPLICIT] Offline clinic appointments managed through slot-based scheduling based on a vet's availability (`openTime`, `closeTime`, `slotInterval`).
* **Instant Matchmaking**: [EXPLICIT] Real-time queue system where a pet owner pays a platform fee upfront and is placed in a `WaitingRoom` until a vet accepts the ping via Socket.io.
* **Video call**: [EXPLICIT] ZegoCloud UI kit integration utilizing `roomID` to safely bridge the vet and the pet owner.

**C. User System**
* **Authentication**: [EXPLICIT] JWT-based authentication with `httpOnly` cookies or Bearer tokens. Includes `isBanned` and `isDeleted` checks for security.
* **Profiles**: [EXPLICIT] Differentiated dashboards. Pet owners track orders and appointments; Vets manage their active clinic and incoming teleconsults.

**D. Admin Panel**
* **Management**: [EXPLICIT] A protected route (`/admin/*`) featuring full CRUD for products, clinics, delivery agents, and users. Includes dynamic Site Settings to toggle marketplace/consult features globally in real-time.

---

## 4. ALGORITHMS & LOGIC

* **Search & filtering (products, vets)**: 
  * [EXPLICIT] Products: Filtered by `isDeleted: false` and queried by category, brand, or name via MongoDB regex queries.
  * [EXPLICIT] Vets: Geospatial queries (implicitly intended if expanding) or simple filtering by `isVerified: true` and active clinic availability.
* **Recommendation system (pet-based suggestions)**: 
  * [INFERRED] Currently relies on an `isFeatured` flag set by admins for top products. Can be expanded using collaborative filtering based on past order history.
* **Scheduling algorithm (vet booking)**: 
  * [EXPLICIT] Algorithm generates 15/30-minute intervals between the clinic's `openTime` and `closeTime`. When an appointment is booked, the specific `timeSlot` is marked as unavailable for that date to prevent double-booking.
* **Payment workflow logic**: 
  * [EXPLICIT] Step 1: Pet owner initiates consult. Step 2: Backend creates a Razorpay `order_id`. Step 3: Client completes payment via Razorpay checkout. Step 4: Webhook/Callback verifies signature and updates `ConsultSession` to `paid`. Step 5: User enters waiting room.

---

## 5. SYSTEM ARCHITECTURE

* **Overall architecture type**: [EXPLICIT] Client-Server architecture (SPA communicating with REST APIs).
* **Microservices vs monolith (justify)**: [EXPLICIT] Monolith. 
  * *Reasoning*: As a startup MVP, a monolithic Express application is faster to iterate on, easier to deploy, and perfectly handles the current load without the overhead of orchestrating Kubernetes clusters or inter-service network latency.

**TEXT DIAGRAM**:
```text
[React Client] 
   │
   ├─(REST HTTP)──→ [Express API Router] ──→ [Controllers] ──→ [Mongoose Models] ──→ [MongoDB]
   │
   └─(WebSockets)─→ [Socket.io Server] ──→ (Matchmaking Logic)
```

---

## 6. DATABASE DESIGN

**Example Schema (Mongoose/NoSQL):**

* **Users**: `_id`, `name`, `email`, `password`, `role` (enum: pet_owner, vet, admin), `isBanned`.
* **DeliveryAgents**: `_id`, `name`, `phone`, `vehicleType`, `isActive`, `totalDeliveries`.
* **Products**: `_id`, `name`, `price`, `stock`, `category`, `imageUrl`, `isFeatured`.
* **Orders**: `_id`, `userRef`, `items` [{`productRef`, `qty`, `price`}], `total`, `status` (placed, processing, delivered, cancelled), `assignedAgent`.
* **Appointments**: `_id`, `petOwnerRef`, `clinicRef`, `date`, `timeSlot`, `status`.
* **ConsultSessions**: `_id`, `petOwnerRef`, `vetRef`, `status` (waiting, in_call, completed), `razorpayPaymentId`.

---

## 7. SECURITY DESIGN

* **JWT authentication**: [EXPLICIT] Passwords hashed via `bcryptjs`. Login issues a signed JWT. Routes are protected by a `protect` middleware that verifies the token and attaches `req.user`.
* **Role-based access (user/vet/admin)**: [EXPLICIT] Specific middleware (`adminOnly`) rejects requests where `req.user.role !== 'admin'`. Frontend routes are guarded by `AdminPrivateRoute`.
* **Payment security**: [EXPLICIT] Server-side signature verification of Razorpay payloads to prevent client-side spoofing.

---

## 8. DEVELOPMENT BLUEPRINT

**Step-by-step how to build PawCare:**
1. **Foundation**: Setup `server/` with Express/Mongoose and `client/` with Vite/React.
2. **Auth & Users**: Implement `User` model, JWT login, and role-based routing.
3. **E-Commerce**: Build `Product` catalog, `CartContext`, and `Order` placement logic.
4. **Offline Vets**: Create `Clinic` models and slot-based `Appointment` booking.
5. **Teleconsultation**: Integrate Razorpay for upfront fees, Socket.io for the waiting room, and ZegoCloud for the video room.
6. **Admin & Logistics**: Build the admin dashboard to oversee the platform, assign `DeliveryAgents`, and dispatch automated `nodemailer` emails.

**Folder Structure (MERN):**
```text
pawcare/
├── client/
│   ├── src/
│   │   ├── admin/       # Admin dashboard views
│   │   ├── components/  # Reusable UI (Cards, Navbar)
│   │   ├── context/     # Auth & Cart contexts
│   │   ├── pages/       # Public & User routes
│   │   └── api/         # Axios instance
├── server/
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth & Roles
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── utils/           # Nodemailer / Sockets
│   └── index.js         # Entry point
```

---

## 9. SCALABILITY PLAN

* **Handling thousands of users**: [INFERRED] 
  * Migrate from in-memory MongoDB to a managed MongoDB Atlas cluster.
  * Serve the React frontend statically via AWS S3 + CloudFront CDN.
* **Caching, load balancing**: [INFERRED] 
  * Implement Redis caching for the `/api/settings/public` and high-traffic `/api/products` endpoints.
  * Deploy the Node.js server across multiple instances behind an NGINX load balancer. Use a Redis Adapter for Socket.io to share real-time state across instances.

---

## 10. AI FEATURES (IMPORTANT)

* **Pet health AI assistant**: [INFERRED] Integrate an LLM (like Gemini or OpenAI) into the frontend. Users can input symptoms, and the AI acts as a triage assistant, recommending whether they should book a standard appointment or an emergency instant consult.
* **Smart recommendations**: [INFERRED] Use machine learning to analyze the `Orders` collection. If a user buys "Puppy Chow", recommend "Chew Toys" and "Puppy Vaccinations".
* **Chatbot for pet queries**: [INFERRED] An automated support bot to handle common order queries ("Where is my delivery agent?") to reduce admin support load.

---

## 11. COMPLETE SYSTEM REBUILD SUMMARY

**Rebuilding PawCare from scratch like a startup:**
1. **Phase 1 (MVP)**: Focus purely on User Auth and the E-Commerce flow. Prove that pet owners are willing to buy products on the platform. Deploy to a single VPS (DigitalOcean/Render).
2. **Phase 2**: Introduce Vet Profiles and offline appointment scheduling. This solves the "discovery" problem without complex video architecture.
3. **Phase 3 (High Value)**: Implement the Teleconsultation queue. Wire up Socket.io and WebRTC (ZegoCloud) for the killer feature.
4. **Phase 4**: Build out the Admin back-office (managing refunds, agents, dynamic site toggles) to transition from a prototype to a manageable business.

---

## 12. CONFIDENCE TAGS

* Architecture Types: `[EXPLICIT]` (I literally built it).
* Tech Stack: `[EXPLICIT]` (Node/Express/React/Mongo/Vite).
* Third-Party APIs: `[EXPLICIT]` (Razorpay, ZegoCloud, Socket.io, Nodemailer).
* Scalability/AI Enhancements: `[INFERRED]` (Logical next steps for a startup of this nature).

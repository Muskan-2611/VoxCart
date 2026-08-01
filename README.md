# VoxCart 🛒🎙️

VoxCart is a state-of-the-art, **bilingual (English & Urdu/Roman Urdu)** voice-controlled smart e-commerce and grocery shopping assistant. It features full-screen interactive voice workflows, advanced **Gemini AI-powered list/bill OCR scanning**, natural language parsing for instant recipe ingredient extraction, live exchange rates, and a robust administration dashboard.

---

## ✨ Core Features

*   **🎙️ Bilingual Voice Assistant**: Search products, add to cart, and control checkout using natural voice commands in English, Urdu (Arabic script), or Roman Urdu (e.g., *"doodh aur anday add karo"*).
*   **📸 Gemini-Powered OCR Scanner**: Scan receipts, handwritten lists, or supermarket invoices. It analyzes the image and extracts only the genuine items, automatically mapping available products and flagging missing ones as "Unavailable" (with zero random or guessed filler items).
*   **🍲 Smart Recipe Auto-Expansion**: Instantly add all ingredients (including proteins, carbs, and crucial spices/essentials) for complex recipes (like *Biryani, Chai, Egg Fried Rice, Omelette*, etc.). It dynamically maps in-store items and flags out-of-stock items as "Unavailable".
*   **💵 Dynamic Multi-Currency System**: Seamlessly switch between **PKR ($Rs.)** and **USD ($)** with live, real-time dynamic exchange rate synchronization.
*   **📊 Master Administration Panel**: Full dashboard to manage products, categories, dynamic subcategories, custom discount rules, user logs, system settings, and analytics charts.
*   **📂 Multi-Service Backends**: Equipped with an Express/Vite full-stack core backend and a standalone PHP/MySQL alternative setup.

---

## 📂 Project Folder Structure

A breakdown of the project layout, emphasizing modularity and clean separation of concerns:

```text
voxcart/
├── server.ts               # Full-stack Node.js Express Server (manages APIs, Gemini OCR, Voice Parsing, & Vite middleware)
├── db_store.json           # Active dynamic JSON database (stores products, categories, subcategories, logs, & orders)
├── package.json            # npm dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite frontend build engine configuration
├── .env.example            # Environment variables blueprint
│
├── src/                    # Frontend React Source Directory
│   ├── main.jsx            # Application mount and React entry point
│   ├── App.jsx             # Main Application hub (manages active view, cart, theme, currencies, and notifications)
│   ├── index.css           # Global stylesheets & custom Tailwind imports
│   │
│   ├── components/         # Modular React Components
│   │   ├── Navbar.jsx            # Responsive navigation, search, cart trigger, and language/currency selectors
│   │   ├── LandingPage.jsx       # Elegant storefront landing banner and featured category grids
│   │   ├── ProductCatalog.jsx    # Complete item catalog (category scrolls, search filtering, & typing-to-recipe triggers)
│   │   ├── VoiceAssistant.jsx    # Immersive voice dashboard (real-time speech recognition, voice drafts, & OCR scanner)
│   │   ├── CartSidebar.jsx       # Sliding cart summary, checkout processing, and interactive item adjustments
│   │   ├── AdminPanel.jsx        # Admin dashboard for products, categories, database editor, and live logs
│   │   ├── MasterSettings.jsx    # Advanced server metrics, custom promo configurations, and reset procedures
│   │   ├── SmartSuggestions.jsx  # Smart AI cross-selling recommendations based on active cart contents
│   │   ├── FavouritesView.jsx    # Saved/bookmarked product hub
│   │   ├── OrdersView.jsx        # Historical purchase invoices tracker
│   │   └── PaymentView.jsx       # Checkout flow, discount calculations, and success notifications
│   │
│   └── utils/              # Client-Side Utilities
│       ├── api.js                # Core API connector (abstracts fetch calls to Express/PHP backends)
│       ├── localizer.js          # High-fidelity bilingual translation dictionary (English ↔ Urdu)
│       └── voiceParser.js        # Local heuristic parser fallback for immediate voice processing
│
└── backend-php-mysql/      # Optional Alternative PHP & SQL Backend
    ├── api.php             # PHP API entry point (mirrors the Express JSON & Gemini endpoints)
    ├── db.php              # PDO Database connector
    └── setup.sql           # Schema definition and initial seed values
```

---

## 🚀 Getting Started

### Prerequisites

*   **Node.js**: Version 18 or above (LTS recommended)
*   **npm**: Version 9 or above
*   **Gemini API Key**: A valid key from Google AI Studio is required for OCR scanning and AI voice parsing.

---

### Step-by-Step Installation Guide

#### 1. Clone the Repository & Install Dependencies
First, navigate to your workspace directory and install all required Node.js dependencies:
```bash
npm install
```

#### 2. Configure Environment Variables
Copy the example environment file to create your active configurations:
```bash
cp .env.example .env
```
Open the `.env` file in your editor and enter your Gemini API Key:
```env
# Gemini API Key (Secret Server-Side Key)
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

#### 3. Run the Development Server
Launch the unified Express backend and Vite development environment:
```bash
npm run dev
```
Once started, the application will be hosted locally at:
*   **Local Web Preview**: [http://localhost:3000](http://localhost:3000)

*The dev script boots the Express server in `server.ts` using `tsx`. The server proxies all front-end assets through Vite's development middleware on a single port for seamless operation.*

---

## 🛠️ Production Build and Deployment

To run VoxCart in a production environment:

1.  **Build the Assets**: Compile the React client application and bundle the TypeScript server using `esbuild`:
    ```bash
    npm run build
    ```
    This generates static optimized client files inside the `/dist` directory and compiles the backend into `dist/server.cjs`.

2.  **Start Production**: Start the compiled production server:
    ```bash
    npm start
    ```
    The server will run on port `3000` with static files served directly through Express.

---

## 🧠 Behind the Scenes: Gemini AI Integration

VoxCart utilizes **Gemini 3.5 Flash** server-side to power its advanced features:

*   **Advanced OCR Scanning**: When an invoice or grocery receipt image is captured, it is converted to Base64 and sent to the `/api/ocr` backend endpoint. Gemini analyzes the document structure, transcribes product names, quantities, and prices, and returns clean JSON. The backend matches these products with the active database, flagging out-of-stock or missing items gracefully.
*   **Natural Language Voice Parsing**: Spoken text is sent to the `/api/voice-parse` endpoint. Gemini parses multi-product lists, dynamic quantities, and complex recipe requests (e.g., *"Make 2 cups of tea and buy some apples"*), intelligently mapping them to system items or identifying recipe ingredients.

---

## 💡 Customization & Resetting

*   **Dynamic Database**: To modify standard store catalog inventories, categories, or logs, you can use the **Admin Panel** or directly edit `db_store.json`.
*   **Factory Reset**: If you wish to restore the store database to its initial template state, open **Admin Panel ➔ Master Settings** and click **"Reset Database"** (or delete `db_store.json` and restart the server).

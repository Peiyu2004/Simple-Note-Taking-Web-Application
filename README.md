# NoteLite 📝

NoteLite is a lightweight, full-stack note-taking web application built with a **Node.js/Express** backend, **SQLite** database, and a **Vue.js (Vite)** frontend, fully containerized using **Docker Compose**.

---

## 🛠️ Tech Stack

* **Frontend:** Vue.js, Vite, HTML5/CSS3
* **Backend:** Node.js, Express (v5)
* **Database:** SQLite
* **Containerization:** Docker & Docker Compose

---

## 🚀 Features

- **Interactive Checkboxes:** Circular checkboxes in both Write and Preview/Details modes that sync directly with state.
- **Live Markdown Preview:** Real-time formatting for lists, headings, and task items.
- **Full Note Management:** Create, view, edit, and delete notes effortlessly.
- **Dockerized Deployment:** Easily run the app in isolated production containers using Docker & Docker Compose.

---

## 🌐 Live Deployments

Frontend App (Vercel): https://simple-note-taking-web-application.vercel.app

Backend API (Render): https://simple-note-taking-web-application.onrender.com

---

## 🛠️ Setup Prerequisites

Before getting started, make sure you have the following installed on your machine:

1. **Node.js** (v18 or higher) & **npm** — [Download Node.js](https://nodejs.org/)
2. **Docker Desktop** — [Download Docker Desktop](https://www.docker.com/products/docker-desktop/) *(Make sure Docker Desktop is open and running)*

---

## 🚀 Setup & Run

Clone the repository:

```bash
git clone https://github.com/Peiyu2004/Simple-Note-Taking-Web-Application.git
```

## 📦 Option 1: Running with Docker (Recommended)

Running with Docker guarantees a consistent environment with Nginx serving the production build.

### 1. Build and Run Container
In your project terminal, execute:

```bash
docker compose up -d --build
```

### 2. Access the Application
Open your browser and navigate to:

Web UI & App: Open http://localhost:5000 in your browser.

API Health Check: Open http://localhost:5000/api.

### 3. Stop the Application
To stop and remove the containers, run:

```bash
docker compose down
```

## 💻 Option 2: Running Locally (Development Mode)

If you prefer to run and modify the source code locally without Docker:

### 1. Start Backend Server

```bash
node server.js
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
cd frontend
npm run dev
```

### 4. Access the Application
Open your browser and navigate to the local development URL (as shown in your terminal output).

Note: Access http://localhost:5173 for interactive frontend development, http://localhost:5000 for backend API healthcheck.

---

## 🤖 Development Process & AI Assistance
During the development of this application, Generative AI was utilized to accelerate feature implementation, design UI layout consistency, and resolve interactive state bugs.

### Example 1: Handling UTC vs. Local Timezone Display
* **Prompt Given:**
> *"How to solve UTC vs local time mismatch when storing ISO strings in SQLite and displaying formatted dates in Vue 3?"*

* **AI Output:**
> A Vue 3 utility function formatDate that takes a raw SQLite timestamp string, converts missing ISO/UTC offsets by appending a 'Z', creates a native JavaScript Date object, and formats it to the local browser timezone (e.g., en-MY format) using toLocaleTimeString().

* **How It Was Modified / Verified:**
Extended the formatting function to include full date options (year: 'numeric', month: 'short', day: 'numeric') alongside toLocaleTimeString() and added a fallback for invalid/null date strings.

* **Why Changes Were Made:**
Storing timestamps in pure UTC on the backend is full-stack best practice. Converting to the client's locale inside Vue 3 ensures users across any timezone see their local time formatted properly (e.g., "11:49 PM" or "Jul 26, 2026, 11:49 PM") without forcing hardcoded timezone conversions on the server.

### Example 2: Vue 3 Component & Tailwind CSS v4 Integration
* **Prompt Given:**
> *"Change the create note button to comply with the edit note styling"*

* **AI Output Code Brief:**
> The AI generated a Vue 3 `<script setup>` single file component using `axios` to fetch/mutate notes, styled with classic Tailwind CSS setup (PostCSS configuration and `@tailwind base;` directives in a global CSS file).

* **How It Was Modified / Verified:**
Migrated the styling setup to **Tailwind CSS v4** using the `@tailwindcss/vite` plugin in `vite.config.js` and imported `@import "tailwindcss";` directly into the CSS.

* **Why Changes Were Made:**
Tailwind CSS v4 simplifies the build pipeline by eliminating the need for `postcss.config.js` and `tailwind.config.js`. Using the dedicated `@tailwindcss/vite` plugin provided faster build times, cleaner configuration, and seamless integration with Vite 6.

### Example 3: Checkbox Toggling Design in Markdown Preview
* **Prompt Given:**
> *"Generate a circle check box design that allows user to checked and unchecked"*

* **AI Output Code Brief:**
> The AI identified that `marked.js` renders Markdown task list inputs with the `disabled` attribute by default. It provided a custom `marked.Renderer()` configuration to remove `disabled` and an event delegation function targeting `<input type="checkbox">` elements.

* **How It Was Modified / Verified:**
Integrated the custom renderer within Vue 3 `<script setup>`, added a custom CSS design for circular checkboxes, and intercepted click events using `event.preventDefault()` to mutate the underlying Markdown string (`- [ ]` $\rightarrow$ `- [x]`).

* **Why Changes Were Made:**
Standard Markdown task lists render non-interactive checkboxes. Replacing the default markup with custom circular styling and handling click state directly in Vue ensured users could toggle task completion smoothly in preview mode without needing to manually edit the Markdown text.
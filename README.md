# Simple-Note-Taking-Web-Application
A web-based Note-Taking App developed using HTML, CSS, Vue.js, Node.js with Express and SQLite.

# frontend

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```


### Set-Up Express.js and SQLite
```
npm init -y

npm install express cors sqlite3
```

### Set-Up Vue
```
npm create vue@latest

cd frontend

npm install
```

### Set-Up Tailwind.css
```
npm install -D tailwindcss postcss autoprefixer
npm install -D @tailwindcss/vite
```

### Run Server
```
node server.js
```

### Run the Frontend Development Server
```
cd frontend
npm run dev
```



## 🤖 Development Process & AI Usage

### Example 1: Tailwind Note Card Styling
- **Prompt:** "Create a modern, clean Tailwind CSS card component for displaying a note with hover shadows and action buttons (Edit, Delete)."
- **AI Output:** Provided a card styled with `shadow-lg`, `border`, and flex layout for action icons.
- **Modification & Verification:** Simplified padding, added a smooth transition (`transition-all duration-200`), and tied click events to Vue setup handlers (`@click="editNote(note)"`).
- **Reasoning:** Kept the UI subtle without over-cluttering while maintaining a modern feel.

### Example 2: Express CRUD Boilerplate & Prisma Client
- **Prompt:** "Write an Express.js router for CRUD operations handling a Note entity using Prisma ORM."
- **AI Output:** Basic route handling for GET, POST, PUT, DELETE with Prisma client queries.
- **Modification & Verification:** Added input validation for missing `title` or `content` and explicit HTTP status code returns (400 for bad input, 404 if note not found).
- **Reasoning:** Ensured robustness and prevented bad API payloads from breaking the database layer.

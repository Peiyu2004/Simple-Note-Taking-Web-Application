<template>
  <div class="app-layout">
    <div class="app-container">
      
      <!-- Top Navigation Header -->
      <header class="app-header">
        <div class="header-branding">
          <router-link to="/" class="brand-link">
            <h1 class="brand-title">Notes Management</h1>
          </router-link>
          <p class="brand-subtitle">Manage your thoughts, tasks, and text notes cleanly.</p>
        </div>

        <nav class="header-nav">
          <router-link
            to="/"
            class="nav-link"
            active-class="active"
          >
            All Notes
          </router-link>
          <router-link
            to="/create"
            class="btn-primary"
          >
            + Create Note
          </router-link>
        </nav>
      </header>

      <!-- Main Dynamic View -->
      <main class="app-content">
        <router-view />
      </main>

    </div>
  </div>
</template>
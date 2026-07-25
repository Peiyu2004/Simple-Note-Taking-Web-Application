<template>
  <div class="home-container">
    <!-- Subheader Bar -->
    <div class="subheader-bar">
      <h2 class="section-title">My Notes</h2>
      <span class="note-counter">
        {{ notes.length }} {{ notes.length === 1 ? 'Note' : 'Notes' }}
      </span>
    </div>

    <!-- Loading State -->
    <div v-if="fetching" class="loading-state">
      Loading notes...
    </div>

    <!-- Empty State -->
    <div v-else-if="notes.length === 0" class="empty-state">
      <p class="empty-title">No notes available</p>
      <router-link to="/create" class="btn-create-first">
        Create your first note
      </router-link>
    </div>

    <!-- Minimal Note Cards Grid -->
    <div v-else class="notes-grid">
      <article
        v-for="note in notes"
        :key="note.id"
        @click="viewNoteDetails(note.id)"
        class="note-card minimal-card"
      >
        <h3 class="note-title">{{ note.title }}</h3>
        <span class="note-date">{{ formatDateUTC8(note.createdAt) }}</span>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const API_URL = import.meta.env.VITE_API_URL || 'https://simple-note-taking-web-application.onrender.com/api/notes';
const router = useRouter();

const notes = ref([]);
const fetching = ref(false);

const fetchNotes = async () => {
  fetching.value = true;
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to load notes');
    notes.value = await res.json();
  } catch (error) {
    console.error('API Error:', error);
  } finally {
    fetching.value = false;
  }
};

const viewNoteDetails = (id) => {
  router.push({ name: 'note-detail', params: { id } });
};

const formatDateUTC8 = (dateString) => {
  if (!dateString) return '';

  const utcString = dateString.endsWith('Z') || dateString.includes('+') 
    ? dateString 
    : dateString.replace(' ', 'T') + 'Z';

  const date = new Date(utcString);

  return new Intl.DateTimeFormat('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

onMounted(() => {
  fetchNotes();
});
</script>
<template>
  <div class="create-note-page">
    <div v-if="loadingNote" class="loading-state">
      Loading note content...
    </div>
    
    <CreateNote
      v-else
      :is-editing="isEditing"
      :editing-note="editingNote"
      :loading="loading"
      @save-note="handleSaveNote"
      @cancel-edit="goHome"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CreateNote from '../components/CreateNote.vue';

const API_URL = import.meta.env.VITE_API_URL || 'https://simple-note-taking-web-application.onrender.com/api/notes';

const route = useRoute();
const router = useRouter();

const isEditing = ref(false);
const loading = ref(false);
const loadingNote = ref(false);
const editingNote = ref({ title: '', content: '' });

onMounted(async () => {
  if (route.params.id) {
    isEditing.value = true;
    loadingNote.value = true;
    try {
      const res = await fetch(`${API_URL}/${route.params.id}`);
      if (res.ok) {
        editingNote.value = await res.json();
      }
    } catch (err) {
      console.error('Failed to load note details for edit:', err);
    } finally {
      loadingNote.value = false;
    }
  }
});

const handleSaveNote = async (formData) => {
  loading.value = true;
  try {
    const method = isEditing.value ? 'PUT' : 'POST';
    const endpoint = isEditing.value ? `${API_URL}/${route.params.id}` : API_URL;

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!res.ok) throw new Error('Save failed');

    router.push('/');
  } catch (error) {
    console.error('Save Error:', error);
  } finally {
    loading.value = false;
  }
};

const goHome = () => {
  router.push('/');
};
</script>
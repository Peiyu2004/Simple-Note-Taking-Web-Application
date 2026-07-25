<template>
  <div class="note-detail-container">
    <div v-if="loading" class="loading-state">
      Loading note...
    </div>

    <div v-else-if="error" class="empty-state">
      <p class="empty-title">{{ error }}</p>
      <router-link to="/" class="btn-primary">Back to Notes</router-link>
    </div>

    <article v-else class="note-detail-card">
      <!-- HEADER SECTION -->
      <header class="detail-header">
        <input
          v-if="editingTitle"
          ref="titleInputRef"
          v-model="editableNote.title"
          type="text"
          class="form-input title-input"
          placeholder="Note title..."
          @blur="saveTitle"
          @keydown.enter="saveTitle"
        />
        <h2
          v-else
          class="detail-title clickable"
          title="Click to edit title"
          @click="enableTitleEdit"
        >
          {{ note.title || 'Untitled Note' }}
        </h2>

        <span class="note-date">{{ formatDateUTC8(note.createdAt) }}</span>
      </header>

      <!-- CONTENT SECTION -->
      <div class="detail-content-section">
        <!-- Formatting Toolbar -->
        <div class="editor-toolbar inline-toolbar">
          <button type="button" class="btn-toolbar task-btn" @click="applyLinePrefix('- [ ] ')">
            ☐ To-Do
          </button>
          <div class="toolbar-divider"></div>
          <button type="button" class="btn-toolbar" @click="applyLinePrefix('- ')">
            • Bullet
          </button>
          <button type="button" class="btn-toolbar" @click="applyLinePrefix('1. ')">
            1. Numbered
          </button>
        </div>

        <!-- Inline Textarea Editor -->
        <div v-if="editingContent" class="inline-editor">
          <textarea
            ref="textareaRef"
            v-model="editableNote.content"
            rows="12"
            class="editor-textarea body-editor"
            placeholder="Type your note content here..."
            @blur="saveContent"
            @keydown.enter="handleEnterKey"
          ></textarea>
        </div>

        <!-- Rendered Note View (Click checkbox to toggle, click text to edit inline) -->
        <div
          v-else
          class="detail-content markdown-body clickable-content"
          title="Click text to edit content"
          v-html="renderedContent"
          @click="handleContentClick"
        ></div>
      </div>

      <!-- ACTION FOOTER -->
      <footer class="detail-actions">
        <button class="btn-secondary" @click="goBack">Back</button>

        <div class="action-group">
          <!-- Delete Action -->
          <button class="btn-action delete" @click="confirmDelete">
            Delete
          </button>

          <!-- Primary Save Changes Action -->
          <button 
            type="button" 
            class="btn-primary" 
            :disabled="saving" 
            @click="saveNoteToDatabase"
          >
            <span v-if="saving" class="saving-indicator">Saving...</span>
            <span v-else>Save Note</span>
          </button>
        </div>
      </footer>
    </article>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { marked } from 'marked';

// standard GFM configuration matching the Create Note component
marked.setOptions({
  gfm: true,
  breaks: true
});

const API_URL = 'http://localhost:5000/api/notes';

const route = useRoute();
const router = useRouter();

const note = ref(null);
const loading = ref(true);
const saving = ref(false);
const error = ref(null);

const editingTitle = ref(false);
const editingContent = ref(false);

const titleInputRef = ref(null);
const textareaRef = ref(null);

const editableNote = reactive({
  title: '',
  content: ''
});

const fetchNote = async () => {
  try {
    const res = await fetch(`${API_URL}/${route.params.id}`);
    if (!res.ok) throw new Error('Note not found');
    const data = await res.json();
    note.value = data;
    editableNote.title = data.title;
    editableNote.content = data.content;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const renderedContent = computed(() => {
  if (!editableNote.content && (!note.value || !note.value.content)) {
    return '<p class="text-placeholder">Click here to add text...</p>';
  }
  return marked.parse(editableNote.content || note.value.content);
});

const enableTitleEdit = () => {
  editingTitle.value = true;
  nextTick(() => titleInputRef.value?.focus());
};

const enableContentEdit = () => {
  editingContent.value = true;
  nextTick(() => textareaRef.value?.focus());
};

const saveNoteToDatabase = async () => {
  saving.value = true;
  try {
    const res = await fetch(`${API_URL}/${route.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editableNote.title,
        content: editableNote.content
      })
    });

    if (!res.ok) throw new Error('Failed to save');

    if (note.value) {
      note.value.title = editableNote.title;
      note.value.content = editableNote.content;
    }
  } catch (err) {
    console.error('Save error:', err);
  } finally {
    saving.value = false;
  }
};

const saveTitle = () => {
  editingTitle.value = false;
  if (note.value && editableNote.title !== note.value.title) {
    saveNoteToDatabase();
  }
};

const saveContent = () => {
  editingContent.value = false;
  if (note.value && editableNote.content !== note.value.content) {
    saveNoteToDatabase();
  }
};

// Handle single-click: Checkbox toggles & saves immediately to database
const handleContentClick = async (event) => {
  if (event.target.tagName === 'INPUT' && event.target.type === 'checkbox') {
    event.stopPropagation(); // Stops launching text editor when clicking checkbox

    const isChecked = event.target.checked;
    const allCheckboxes = Array.from(
      event.currentTarget.querySelectorAll('input[type="checkbox"]')
    );
    const clickedIndex = allCheckboxes.indexOf(event.target);

    const lines = (editableNote.content || note.value.content || '').split('\n');
    let checkboxIndex = 0;

    const updatedLines = lines.map((line) => {
      if (/^\s*[-*]\s*\[[ xX]\]/.test(line)) {
        if (checkboxIndex === clickedIndex) {
          line = isChecked 
            ? line.replace(/\[ \]/, '[x]') 
            : line.replace(/\[[xX]\]/, '[ ]');
        }
        checkboxIndex++;
      }
      return line;
    });

    const updatedContent = updatedLines.join('\n');
    editableNote.content = updatedContent;
    if (note.value) {
      note.value.content = updatedContent;
    }

    await saveNoteToDatabase();
  } else {
    enableContentEdit();
  }
};

const applyLinePrefix = (prefix) => {
  if (!editingContent.value) {
    editingContent.value = true;
    nextTick(() => executePrefix(prefix));
  } else {
    executePrefix(prefix);
  }
};

const executePrefix = (prefix) => {
  const el = textareaRef.value;
  if (!el) return;

  const cursorPos = el.selectionStart;
  const content = editableNote.content;

  const lineStart = content.lastIndexOf('\n', cursorPos - 1) + 1;
  let lineEnd = content.indexOf('\n', cursorPos);
  if (lineEnd === -1) lineEnd = content.length;

  const currentLine = content.substring(lineStart, lineEnd);
  let updatedLine = '';

  if (/^\s*[-*]\s*\[[ xX]\]\s*/.test(currentLine) && prefix.includes('[')) {
    updatedLine = currentLine.replace(/^\s*[-*]\s*\[[ xX]\]\s*/, '');
  } else if (currentLine.startsWith(prefix)) {
    updatedLine = currentLine.substring(prefix.length);
  } else {
    const cleanLine = currentLine.replace(/^([-*]\s*\[[ xX]\]\s*|[-*]\s*|\d+\.\s*)/, '');
    updatedLine = prefix + cleanLine;
  }

  editableNote.content = content.substring(0, lineStart) + updatedLine + content.substring(lineEnd);

  setTimeout(() => {
    el.focus();
    const newCursor = lineStart + updatedLine.length;
    el.setSelectionRange(newCursor, newCursor);
  }, 0);
};

const handleEnterKey = (event) => {
  const el = textareaRef.value;
  if (!el) return;

  const cursorPos = el.selectionStart;
  const lineStart = editableNote.content.lastIndexOf('\n', cursorPos - 1) + 1;
  const currentLine = editableNote.content.substring(lineStart, cursorPos);

  if (/^([-*]\s*\[[ xX]\]\s*|[-*]\s*|\d+\.\s*)$/.test(currentLine)) {
    event.preventDefault();
    editableNote.content = editableNote.content.substring(0, lineStart) + editableNote.content.substring(cursorPos);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(lineStart, lineStart);
    }, 0);
  }
};

const confirmDelete = async () => {
  if (!confirm('Are you sure you want to delete this note?')) return;
  try {
    await fetch(`${API_URL}/${route.params.id}`, { method: 'DELETE' });
    router.push('/');
  } catch (err) {
    console.error('Delete Error:', err);
  }
};

const goBack = () => router.push('/');

const formatDateUTC8 = (dateString) => {
  if (!dateString) return '';
  const utcString = dateString.endsWith('Z') || dateString.includes('+') 
    ? dateString 
    : dateString.replace(' ', 'T') + 'Z';

  return new Intl.DateTimeFormat('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(new Date(utcString));
};

onMounted(() => {
  fetchNote();
});
</script>
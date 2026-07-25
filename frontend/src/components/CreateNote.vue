<template>
  <div class="form-card">
    <h2 class="form-title">
      {{ isEditing ? 'Edit Note' : 'Create New Note' }}
    </h2>

    <form @submit.prevent="handleSubmit">
      <!-- Title Input -->
      <div class="form-group">
        <label class="form-label">Title</label>
        <input
          v-model="form.title"
          type="text"
          placeholder="Enter note title..."
          required
          class="form-input"
        />
      </div>

      <!-- Editor Section -->
      <div class="form-group">
        <div class="editor-header">
          <!-- View Toggle Tabs -->
          <div class="editor-tabs">
            <button
              type="button"
              :class="['tab-btn', { active: activeTab === 'write' }]"
              @click="activeTab = 'write'"
            >
              Write
            </button>
            <button
              type="button"
              :class="['tab-btn', { active: activeTab === 'preview' }]"
              @click="activeTab = 'preview'"
            >
              Preview
            </button>
          </div>

          <!-- Formatting Toolbar -->
          <div v-if="activeTab === 'write'" class="editor-toolbar">
            <button 
              type="button" 
              @click="applyLinePrefix('- [ ] ')" 
              class="btn-toolbar task-btn" 
              title="Toggle To-Do Item for current line"
            >
              ☐ To-Do
            </button>
            <div class="toolbar-divider"></div>
            <button 
              type="button" 
              @click="applyLinePrefix('- ')" 
              class="btn-toolbar" 
              title="Add Bullet to current line"
            >
              • Bullet
            </button>
            <button 
              type="button" 
              @click="applyLinePrefix('1. ')" 
              class="btn-toolbar" 
              title="Add Number to current line"
            >
              1. Numbered
            </button>
          </div>
        </div>

        <!-- Normal Textarea Editor -->
        <textarea
          v-if="activeTab === 'write'"
          ref="textareaRef"
          v-model="form.content"
          rows="10"
          placeholder="Type normally here... Use the toolbar above to turn any line into a list or checkbox."
          required
          class="editor-textarea"
          @keydown.enter="handleEnterKey"
        ></textarea>

        <!-- Live Preview Tab with Clickable Checkboxes -->
        <div
          v-else
          class="editor-preview markdown-body"
          v-html="parsedPreview"
          @click="handlePreviewCheckboxToggle"
        ></div>
      </div>

      <!-- Form Action Buttons -->
      <div class="form-actions">
        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? 'Saving...' : isEditing ? 'Update Note' : 'Add Note' }}
        </button>

        <button type="button" @click="handleCancel" class="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, watch, ref, computed } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  isEditing: { type: Boolean, default: false },
  editingNote: { type: Object, default: () => ({ title: '', content: '' }) },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['save-note', 'cancel-edit']);

const activeTab = ref('write');
const textareaRef = ref(null);

const form = reactive({
  title: '',
  content: ''
});

watch(
  () => props.editingNote,
  (newNote) => {
    if (newNote) {
      form.title = newNote.title || '';
      form.content = newNote.content || '';
    }
  },
  { immediate: true, deep: true }
);

const parsedPreview = computed(() => {
  if (!form.content.trim()) return '<p class="text-placeholder">Nothing to preview yet...</p>';
  return marked.parse(form.content, { gfm: true, breaks: true });
});

/**
 * Toggles a prefix (bullet/number/checkbox) directly onto the CURRENT cursor line.
 * If the line already has a checkbox, clicking again removes it (resets back to normal text).
 */
const applyLinePrefix = (prefix) => {
  const el = textareaRef.value;
  if (!el) return;

  const cursorPos = el.selectionStart;
  const content = form.content;

  const lineStart = content.lastIndexOf('\n', cursorPos - 1) + 1;
  let lineEnd = content.indexOf('\n', cursorPos);
  if (lineEnd === -1) lineEnd = content.length;

  const currentLine = content.substring(lineStart, lineEnd);

  let updatedLine = '';
  // If line already starts with a checkbox (checked or unchecked), toggle it off to normal text
  if (/^\s*[-*]\s*\[[ xX]\]\s*/.test(currentLine) && prefix.includes('[')) {
    updatedLine = currentLine.replace(/^\s*[-*]\s*\[[ xX]\]\s*/, '');
  } else if (currentLine.startsWith(prefix)) {
    updatedLine = currentLine.substring(prefix.length);
  } else {
    // Clean out existing list prefixes before applying new prefix
    const cleanLine = currentLine.replace(/^([-*]\s*\[[ xX]\]\s*|[-*]\s*|\d+\.\s*)/, '');
    updatedLine = prefix + cleanLine;
  }

  form.content = content.substring(0, lineStart) + updatedLine + content.substring(lineEnd);

  setTimeout(() => {
    el.focus();
    const newCursor = lineStart + updatedLine.length;
    el.setSelectionRange(newCursor, newCursor);
  }, 0);
};

/**
 * Interactive Checkbox Toggling inside Preview mode
 */
const handlePreviewCheckboxToggle = (event) => {
  if (event.target.type === 'checkbox') {
    const isChecked = event.target.checked;
    const lines = form.content.split('\n');
    let checkboxIndex = 0;

    const allCheckboxesInPreview = Array.from(
      event.currentTarget.querySelectorAll('input[type="checkbox"]')
    );
    const clickedIndex = allCheckboxesInPreview.indexOf(event.target);

    const updatedLines = lines.map((line) => {
      if (/^\s*[-*]\s*\[[ xX]\]/.test(line)) {
        if (checkboxIndex === clickedIndex) {
          line = isChecked ? line.replace(/\[ \]/, '[x]') : line.replace(/\[[xX]\]/, '[ ]');
        }
        checkboxIndex++;
      }
      return line;
    });

    form.content = updatedLines.join('\n');
  }
};

/**
 * Resets back to normal text when hitting Enter on an empty formatted line.
 */
const handleEnterKey = (event) => {
  const el = textareaRef.value;
  if (!el) return;

  const cursorPos = el.selectionStart;
  const lineStart = form.content.lastIndexOf('\n', cursorPos - 1) + 1;
  const currentLine = form.content.substring(lineStart, cursorPos);

  if (/^([-*]\s*\[[ xX]\]\s*|[-*]\s*|\d+\.\s*)$/.test(currentLine)) {
    event.preventDefault();
    form.content = form.content.substring(0, lineStart) + form.content.substring(cursorPos);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(lineStart, lineStart);
    }, 0);
  }
};

const handleSubmit = () => {
  if (!form.title.trim() || !form.content.trim()) return;
  emit('save-note', { title: form.title, content: form.content });
};

const handleCancel = () => {
  form.title = '';
  form.content = '';
  emit('cancel-edit');
};
</script>
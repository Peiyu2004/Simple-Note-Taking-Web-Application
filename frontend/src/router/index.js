import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CreateNoteView from '../views/CreateNoteView.vue';
import NoteDetailView from '../views/NoteDetailView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Home - Notes Management' }
  },
  {
    path: '/create',
    name: 'create-note',
    component: CreateNoteView,
    meta: { title: 'Create Note - Notes Management' }
  },
  {
    path: '/notes/:id',
    name: 'note-detail',
    component: NoteDetailView,
    meta: { title: 'Note Details - Notes Management' }
  }
  // Removed '/edit/:id' route
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.afterEach((to) => {
  document.title = to.meta.title || 'Notes Management';
});

export default router;
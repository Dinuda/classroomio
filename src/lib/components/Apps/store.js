import { writable } from 'svelte/store';

export const apps = writable({
  open: false,
  dropdown: false
});
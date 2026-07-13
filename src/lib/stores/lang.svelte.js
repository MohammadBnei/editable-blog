// Shared reader-language preference (EN/FR), persisted to localStorage.
// Read/written from both the layout's settings dropdown and the blog
// listing page, so it lives here instead of local component state.
let lang = $state('en');

export const langPref = {
  get value() {
    return lang;
  },
  set value(l) {
    lang = l;
    localStorage.setItem('blog-lang', l);
  },
  hydrate() {
    lang = localStorage.getItem('blog-lang') || 'en';
  }
};

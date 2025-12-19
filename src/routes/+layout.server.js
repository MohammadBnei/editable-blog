import { getPage } from '$lib/api';

// src/routes/+layout.server.js
export async function load({ locals }) {
  const page = await getPage('home', locals.lang);

  return {
    lang: locals.lang,
    currentUser: locals.user,
    title: page.title,
    description: page.description,
    pitch: page.pitch,
    bioPicture: page.bioPicture
  };
}

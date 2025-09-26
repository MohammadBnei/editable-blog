// src/routes/+layout.server.js
export async function load({ locals }) {
  return {
    lang: locals.lang,
    currentUser: locals.user
  };
}

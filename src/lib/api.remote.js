import * as v from 'valibot';
import { query } from '$app/server';
import { getRequestEvent } from '$app/server';
import { search, getCurrentUser } from '$lib/api';

const SearchSchema = v.object({
  q: v.string(),
  lang: v.optional(v.picklist(['en', 'fr']), 'en')
});

export const getSearchResults = query(SearchSchema, async ({ q, lang }) => {
  const event = getRequestEvent();
  const sessionId = event.cookies.get('session_id');
  const currentUser = await getCurrentUser(sessionId);
  
  return await search(q, currentUser, lang);
});

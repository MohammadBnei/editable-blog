# My Personal Editable Blog

A SvelteKit template for coding **completely custom websites**, while allowing non-technical people to **make edits** to the content by simply logging in with a secure admin password. This particular instance is set up for my personal blog, utilizing PostgreSQL for the database and n8n for translation and LinkedIn post creation. It also uses `carta` to render and edit markdown.

This blog supports:

- **Multi-language content** for articles and pages.
- **Article management**: Create, edit, publish, unpublish, and delete blog posts.
- **Page management**: Edit static page content (e.g., "About", "Contact").
- **Asset management**: Upload and manage images directly within the editor.
- **LinkedIn Integration**: Create, validate, publish, and manage LinkedIn posts directly from articles, leveraging n8n for automated posting and translation workflows.
- **Basic analytics**: Simple page view counters.

Check out the blog at [blog.bnei.dev](https://blog.bnei.dev).

See it out in the wild at [sonjastojanovic.com](https://sonjastojanovic.com), [nisse.tech](https://nisse.tech), [michaelaufreiter.com](https://michaelaufreiter.com), [postowl.com](https://postowl.com), and [trails-shop.at](https://trails-shop.at).

Read the discussion on [Hackernews](https://news.ycombinator.com/item?id=35456083).

Editable Website won the 2nd price in the [SvelteHack 2023](https://hack.sveltesociety.dev/winners). 🥳 We still can't believe it. Big thanks to the [Svelte Society](https://sveltesociety.dev/) and congrats to the other winners, and everyone who participated. 🙏 So many inspiring projects!

## But why?

It's a dynamic website but light as a feather compared to building on top of a CMS. It makes editing content self-explanatory for end-users.

## Step 0 - Requirements

- Node.js 18+
- bun
- PostgreSQL

These are needed to run this personal blog.

## Step 1 - Development setup

This is a full-fledged web app you want to adjust to your own needs. So please **create a copy** or fork of the source code and rename the project accordingly.

First clone the repository.

```bash
$ git clone https://github.com/michael/editable-blog.git
cd editable-blog
```

Install the dependencies.

```bash
bun install
```

Copy the contents of `.env.example` into `.env` and adjust to your needs.

```bash
DATABASE_URL="postgresql://user:password@host:port/database"
ADMIN_PASSWORD=xxxxxxxxxxxx
ORIGIN=http://localhost:5173
N8N_USERNAME=your_n8n_username
N8N_PASSWORD=your_n8n_password
```

Initialize the database schema and apply migrations:

```bash
# Ensure your DATABASE_URL in .env is correctly set up for a PostgreSQL database.
# Then run the migration script:
node src/lib/migrate.js
```

Once you've created a project and installed dependencies with `bun install` , start a development server:

```bash
bun run dev
```

To create and test a production version of your app:

```bash
bun run build
```

You can preview the production build with `bun run preview`.

## Making changes to your website

You can literally do everything that SvelteKit allows you to do. Below is the source code for the /imprint page, which has a `<PlainText>` title and `<RichText>` content.

```svelte
<svelte:head>
  <title>Imprint</title>
</svelte:head>

{#if showUserMenu}
  <Modal on:close={() => (showUserMenu = false)}>
    <div class="w-full flex flex-col space-y-4 p-4 sm:p-6">
      <PrimaryButton on:click={toggleEdit}>Edit page</PrimaryButton>
      <LoginMenu {currentUser} />
    </div>
  </Modal>
{/if}

{#if editable}
  <EditorToolbar on:cancel={initOrReset} on:save={savePage} />
{/if}

<WebsiteNav bind:showUserMenu {currentUser} bind:editable />

<div class="py-12 sm:py-24">
  <div class="max-w-(--breakpoint-lg) mx-auto px-6 md:text-xl">
    <h1 class="text-4xl md:text-7xl font-bold pb-8">
      <PlainText {editable} bind:content={title} />
    </h1>
    <div class="prose md:prose-xl pb-12 sm:pb-24">
      <RichText multiLine {editable} bind:content={imprint} />
    </div>
  </div>
</div>

<Footer counter="/imprint" />
```

To see the full picture, open [src/routes/imprint/+page.svelte](src/routes/imprint/%2Bpage.svelte) and [src/routes/imprint/+page.server.js](src/routes/imprint/%2Bpage.server.js).

Please use this as a starting point for new pages you want to add to your website. `editable-blog` is not a widget-library on purpose. Instead you are encouraged to inspect and adjust all source code, including the [schema](./src/lib/prosemirrorSchemas.js) for the editors. I want you to be in control of everything. No behind-the-scene magic.

## Making changes to the content

Just navigate to `http://127.0.0.1:5173/login` and enter your secure admin password (`ADMIN_PASSWORD`). Now you see an additional ellipsis menu, which will provide you an "Edit page" or "Edit post" option for all pages that you have set up as "editable".

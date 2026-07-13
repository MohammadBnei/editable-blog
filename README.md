# My Personal Editable Blog

This is my personal blog, utilizing PostgreSQL for the database and n8n for translation and LinkedIn post creation. It also uses `carta` to render and edit markdown.

This blog supports:

- **Multi-language content** for articles and pages.
- **Article management**: Create, edit, publish, unpublish, and delete blog posts.
- **Page management**: Edit static page content (e.g., "About", "Contact", "Portfolio", "Resume").
- **Asset management**: Upload and manage images directly within the editor.
- **LinkedIn Integration**: Create, validate, publish, and manage LinkedIn posts directly from articles, leveraging n8n for automated posting and translation workflows.
- **Automated Translation**: New blog posts can be automatically translated into multiple languages using n8n workflows.
- **Basic analytics**: Simple page view counters.

Check out the blog at [blog.bnei.dev](https://blog.bnei.dev).

## But why?

It's a dynamic website but light as a feather compared to building on top of a CMS. It makes editing content self-explanatory for end-users.

## Step 0 - Requirements

- Node.js 18+
- bun
- PostgreSQL
- n8n (for automated translations and LinkedIn posting)

These are needed to run this personal blog.

## Step 1 - Development setup

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

```
ADMIN_PASSWORD=xxxxxxxxxxxxxx
ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://user:pass@localhost:5432/ad"

N8N_USERNAME=xxx
N8N_PASSWORD=xxx
N8N_LINKEDIN_WEBHOOK_URL=xxx
N8N_TRANSLATION_WEBHOOK_URL=xxx
N8N_LINKEDIN_POSTER=xxx
N8N_LINKEDIN_POST_CREATOR=xxx
```

Initialize the database schema and apply migrations:

Migrations are automatically applied on application startup.

```bash
# Ensure your DATABASE_URL in .env is correctly set up for a PostgreSQL database.
# No manual migration command is needed as they are applied on startup.
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

## Deployment

This project is set up for continuous deployment with a robust GitOps workflow.

- **Kubernetes Deployment**: The application is deployed to Kubernetes using Kustomize, with configuration files located in the `k8s` folder.
- **CI/CD**: A complete Continuous Integration/Continuous Delivery pipeline is in place to automate testing and deployment.
- **GitOps with Argo CD**: Argo CD is used for GitOps, ensuring that the deployed application state automatically synchronizes with the configuration defined in the Git repository.

## Making changes to your website

You can literally do everything that SvelteKit allows you to do.

## Making changes to the content

Just navigate to `http://127.0.0.1:5173/login` and enter your secure admin password (`ADMIN_PASSWORD`). Now you see an additional ellipsis menu, which will provide you an "Edit page" or "Edit post" option for all pages that you have set up as "editable".

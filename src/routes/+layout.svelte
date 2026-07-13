<script>
  import '../lib/index.css';
</script>

<div
  class="min-h-screen bg-slate-50 font-sans text-slate-800 dark:bg-slate-950 dark:text-slate-200"
>
  <header
    class="sticky top-0 z-10 border-b border-slate-200/80 bg-slate-50/80 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80"
  >
    <div class="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
      <a href="/" class="text-lg font-bold tracking-tight hover:text-blue-600 transition-colors"
        >bnei.dev</a
      >
      <nav class="flex gap-1 text-sm font-medium">
        <a
          href="/"
          class="rounded-full px-3 py-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition-colors"
          >Home</a
        >
        <a
          href="/blog"
          class="rounded-full px-3 py-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition-colors"
          >Articles</a
        >
        <a
          href="/portfolio"
          class="rounded-full px-3 py-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition-colors"
          >Portfolio</a
        >
        <a
          href="/resume"
          class="rounded-full px-3 py-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition-colors"
          >Resume</a
        >
      </nav>
    </div>
  </header>

  <main class="mx-auto max-w-3xl px-4 py-12">
    <slot />
  </main>

  <footer
    class="mx-auto max-w-3xl px-4 py-12 text-center text-sm text-slate-400 dark:text-slate-500"
  >
    &copy; {new Date().getFullYear()} bnei.dev
  </footer>
</div>

<script>
  import { classNames } from '$lib/util';
  import PrimaryButton from './PrimaryButton.svelte';
</script>

<div class={classNames('py-12 sm:py-24 border-t-2 border-gray-100')}>
  <div
    class="max-w-(--breakpoint-md) mx-auto px-6 flex flex-col sm:flex-row space-y-6 sm:space-x-8 sm:space-y-0"
  >
    <img
      class="shrink-0 w-24 h-24 rounded-full"
      src="/images/person-placeholder.jpg"
      alt="Mohammad-Amine BANAEI"
    />
    <div>
      <h2 class="text-3xl md:text-5xl font-bold">Hi, I'm Mohammad-Amine.</h2>
      <div class="mt-4 md:text-xl">
        I'm a developer passionate about building efficient and precise solutions, with a focus on Go, JavaScript, and robust system architecture.
      </div>
      <div class="pt-8 sm:pt-12">
        <PrimaryButton size="lg" href="/">Learn more</PrimaryButton>
      </div>
    </div>
  </div>
</div>

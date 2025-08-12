<script>
  import { classNames } from '$lib/util';
  import PrimaryButton from './PrimaryButton.svelte';
  import { currentLang } from '$lib/stores';

  $: greeting =
    $currentLang === 'fr' ? 'Salut, je suis Mohammad-Amine.' : "Hi, I'm Mohammad-Amine.";
  $: bio =
    $currentLang === 'fr'
      ? 'Je suis un développeur passionné par la création de solutions efficaces et précises, avec un accent sur Go, JavaScript et l\'architecture système.'
      : "I'm a developer passionate about building efficient and precise solutions, with a focus on Go, JavaScript, and robust system architecture.";
  $: learnMore = $currentLang === 'fr' ? 'En savoir plus' : 'Learn more';
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
      <h2 class="text-3xl md:text-5xl font-bold">{greeting}</h2>
      <div class="mt-4 md:text-xl">
        {bio}
      </div>
      <div class="pt-8 sm:pt-12">
        <PrimaryButton size="lg" href="/">{learnMore}</PrimaryButton>
      </div>
    </div>
  </div>
</div>

<script>
  import TrustCard from './TrustCard.svelte';

  let { trustCards = $bindable([]) } = $props();

  // Default trust cards data
  const defaultTrustCards = [
    {
      title: 'The "Deployment Anxiety" Fix',
      pain: 'We dread deployments because they break production.',
      architecture: '3-Node HA Kubernetes Cluster + GitOps (ArgoCD)',
      impact: `90% Faster Releases: Cut deployment time from 2 hours to <10 minutes.
Stability: Reduced deployment failure rate from 40% to <5%.`
    },
    {
      title: 'The "Data Stagnation" Fix',
      pain: 'Our analytics are useless because the data is hours old.',
      architecture: 'Parallelized Query Execution & MongoDB Aggregation',
      impact: `7x Velocity Increase: Reduced CSV export time from 15 minutes to <2 minutes for 100k+ records.
Efficiency: Eliminated blocking processes, allowing marketing teams instant access to data.`
    },
    {
      title: 'The "Latency" Fix',
      pain: 'The app crashes or lags when user traffic spikes.',
      architecture: 'Real-time Redis ecosystem + High-Performance Webhooks',
      impact: `<100ms Latency: Maintained sub-100ms response times for thousands of concurrent participants during live contests.
Scale: Zero message loss during "thundering herd" events via optimized Node.js/Go logic.`
    }
  ];

  // Initialize with default data if no data provided
  if (trustCards.length === 0) {
    trustCards = defaultTrustCards;
  }
</script>

<div class="bg-white pb-6 sm:pb-12">
  <div class="max-w-(--breakpoint-lg) mx-auto px-6">
    <div class="font-bold text-sm sm:text-base py-12 sm:pt-24 pb-8">WHY TRUST MY EXPERTISE</div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
      {#each trustCards as card, i}
        <TrustCard
          title={card.title}
          pain={card.pain}
          architecture={card.architecture}
          impact={card.impact}
        />
      {/each}
    </div>
  </div>
</div>

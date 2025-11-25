<script>
  import TrustCard from './TrustCard.svelte';
  import { isEditing } from '$lib/stores.js';

  let { trustCards = $bindable([]) } = $props();

  // Default trust cards data
  const defaultTrustCards = [
    `<h2>The "Deployment Anxiety" Fix</h2>
<p><strong>The Pain:</strong> "We dread deployments because they break production."</p>
<p><strong>The Architecture:</strong> 3-Node HA Kubernetes Cluster + GitOps (ArgoCD)</p>
<p><strong>The Impact:</strong><br>
90% Faster Releases: Cut deployment time from 2 hours to &lt;10 minutes.<br>
Stability: Reduced deployment failure rate from 40% to &lt;5%.</p>`,
    
    `<h2>The "Data Stagnation" Fix</h2>
<p><strong>The Pain:</strong> "Our analytics are useless because the data is hours old."</p>
<p><strong>The Architecture:</strong> Parallelized Query Execution & MongoDB Aggregation</p>
<p><strong>The Impact:</strong><br>
7x Velocity Increase: Reduced CSV export time from 15 minutes to &lt;2 minutes for 100k+ records.<br>
Efficiency: Eliminated blocking processes, allowing marketing teams instant access to data.</p>`,
    
    `<h2>The "Latency" Fix</h2>
<p><strong>The Pain:</strong> "The app crashes or lags when user traffic spikes."</p>
<p><strong>The Architecture:</strong> Real-time Redis ecosystem + High-Performance Webhooks</p>
<p><strong>The Impact:</strong><br>
&lt;100ms Latency: Maintained sub-100ms response times for thousands of concurrent participants during live contests.<br>
Scale: Zero message loss during "thundering herd" events via optimized Node.js/Go logic.</p>`
  ];

  // Initialize with default data if no data provided
  if (trustCards.length === 0) {
    trustCards = defaultTrustCards;
  }

  function addTrustCard() {
    trustCards.push('<h2>New Trust Item</h2><p>Add your content here...</p>');
    trustCards = trustCards; // trigger update
  }

  function deleteTrustCard(index) {
    trustCards.splice(index, 1);
    trustCards = trustCards; // trigger update
  }

  function moveTrustCard(index, direction) {
    let toIndex;
    if (direction === 'up' && index > 0) {
      toIndex = index - 1;
    } else if (direction === 'down' && index < trustCards.length - 1) {
      toIndex = index + 1;
    } else {
      return; // operation not possible
    }
    // Remove item from original position
    const element = trustCards.splice(index, 1)[0];
    // Insert at new position
    trustCards.splice(toIndex, 0, element);
    trustCards = trustCards; // trigger update
  }
</script>

<div class="bg-white pb-6 sm:pb-12">
  <div class="max-w-(--breakpoint-lg) mx-auto px-6">
    <div class="font-bold text-sm sm:text-base py-12 sm:pt-24 pb-8">WHY TRUST MY EXPERTISE</div>
    
    {#each trustCards as content, i}
      <TrustCard
        bind:content={trustCards[i]}
        index={i}
        onDelete={() => deleteTrustCard(i)}
        onMoveUp={() => moveTrustCard(i, 'up')}
        onMoveDown={() => moveTrustCard(i, 'down')}
      />
    {/each}

    {#if $isEditing}
      <div class="text-center pb-12 border-b border-gray-100">
        <SecondaryButton on:click={addTrustCard}>Add Trust Item</SecondaryButton>
      </div>
    {/if}
  </div>
</div>

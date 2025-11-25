<script>
  let { title, pain, architecture, impact } = $props();
</script>

<div class="card w-96 bg-base-100 card-md shadow-sm">
  <div class="card-body">
    <h2 class="card-title">{title}</h2>
    
    <div class="space-y-4">
      <div>
        <h3 class="font-semibold text-sm text-gray-600 uppercase tracking-wide">The Pain</h3>
        <p class="text-sm">{pain}</p>
      </div>
      
      <div>
        <h3 class="font-semibold text-sm text-gray-600 uppercase tracking-wide">The Architecture</h3>
        <p class="text-sm">{architecture}</p>
      </div>
      
      <div>
        <h3 class="font-semibold text-sm text-gray-600 uppercase tracking-wide">The Impact</h3>
        <p class="text-sm">{impact}</p>
      </div>
    </div>
  </div>
</div>

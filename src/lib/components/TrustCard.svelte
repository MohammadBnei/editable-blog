<script>
  let { title, pain, architecture, impact } = $props();
</script>

<div class="card bg-base-100 card-md shadow-sm">
  <div class="card-body">
    <h2 class="card-title">{title}</h2>
    
    <div class="space-y-4">
      <div>
        <h3 class="font-semibold text-xs text-gray-600 uppercase tracking-wide">Pain</h3>
        <p class="">{pain}</p>
      </div>
      
      <div>
        <h3 class="font-semibold text-xs text-gray-600 uppercase tracking-wide">Architecture</h3>
        <p class="">{architecture}</p>
      </div>
      
      <div>
        <h3 class="font-semibold text-xs text-gray-600 uppercase tracking-wide">Impact</h3>
        <p class="">{impact}</p>
      </div>
    </div>
  </div>
</div>

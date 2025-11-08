<script>
  import { createEventDispatcher } from 'svelte';
  import PrimaryButton from './PrimaryButton.svelte';

  const dispatch = createEventDispatcher();

  let projectTitle = '';

  function handleCreate() {
    if (projectTitle.trim()) {
      dispatch('create', { projectTitle });
    }
  }

  function handleClose() {
    dispatch('close');
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
  <div class="bg-white p-6 rounded-lg shadow-lg w-96">
    <h2 class="text-xl font-bold mb-4">Create New Project</h2>
    <div class="mb-4">
      <label for="projectTitle" class="block text-sm font-medium text-gray-700">Project Title</label>
      <input
        type="text"
        id="projectTitle"
        bind:value={projectTitle}
        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        placeholder="Enter project title"
        on:keydown={(e) => { if (e.key === 'Enter') handleCreate(); }}
      />
    </div>
    <div class="flex justify-end space-x-4">
      <button on:click={handleClose} class="btn btn-secondary">Cancel</button>
      <PrimaryButton on:click={handleCreate} disabled={!projectTitle.trim()}>Create</PrimaryButton>
    </div>
  </div>
</div>

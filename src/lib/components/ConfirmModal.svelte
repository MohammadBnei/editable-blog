<script>
  import { createEventDispatcher } from 'svelte';
  import PrimaryButton from './PrimaryButton.svelte';

  const dispatch = createEventDispatcher();

  export let message = 'Are you sure you want to proceed?';
  export let confirmText = 'Confirm';
  export let cancelText = 'Cancel';
  export let confirmClass = 'bg-red-500 hover:bg-red-700';

  function handleConfirm() {
    dispatch('confirm');
  }

  function handleCancel() {
    dispatch('cancel');
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
  <div class="bg-white p-6 rounded-lg shadow-lg w-96">
    <h2 class="text-xl font-bold mb-4">Confirmation</h2>
    <p class="mb-4">{message}</p>
    <div class="flex justify-end space-x-4">
      <button on:click={handleCancel} class="btn btn-secondary">{cancelText}</button>
      <PrimaryButton on:click={handleConfirm} class={confirmClass}>{confirmText}</PrimaryButton>
    </div>
  </div>
</div>

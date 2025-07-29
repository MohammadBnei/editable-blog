<script>
  import { toggleMark } from 'prosemirror-commands';
  import { markActive } from '$lib/editor/prosemirrorUtil';
  import { classNames } from '$lib/util';

  let { editorView, editorState, type } = $props();

  $: schema = editorState.schema;
  $: markType = schema.marks[type];

  $: command = toggleMark(markType);
  $: disabled = !markType || !command(editorState, null);
  $: active = markActive(markType)(editorState);

  function handleClick() {
    command(editorState, editorView.dispatch, editorView);
    editorView.focus();
  }
</script>

<button
  onclick={handleClick}
  {disabled}
  class={classNames(
    active ? 'bg-gray-900 text-white' : 'hover:bg-gray-100',
    'sm:mx-1 rounded-full p-2 disabled:opacity-30'
  )}
>
  <slot />
</button>

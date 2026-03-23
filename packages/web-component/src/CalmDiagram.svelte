<svelte:options
  customElement={{
    tag: 'calm-diagram',
    shadow: { mode: 'open' },
    props: {
      src: { type: 'String', attribute: 'src' },
      data: { type: 'String', attribute: 'data' },
      theme: { type: 'String', attribute: 'theme', reflect: true },
      flow: { type: 'String', attribute: 'flow' },
    },
  }}
/>

<script lang="ts">
  let {
    src = '',
    data = '',
    theme = 'light',
    flow = '',
  }: { src?: string; data?: string; theme?: 'light' | 'dark'; flow?: string } = $props();
</script>

<div class="diagram-container">
  <slot />
</div>

<style>
  :host {
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .diagram-container {
    width: 100%;
    height: 100%;
  }
</style>

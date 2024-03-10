<script>
  import GitlabAPI from '$lib/apis/gitlab';
  import Inbox from '$lib/Inbox.svelte';
  import GitlabConfiguration from '$lib/GitlabConfiguration.svelte';
  import { get } from 'svelte/store';
  import { isPopup, isBrowser } from '$lib/utils';

  let extensionIsConfigured;
  $: {
    if (isBrowser()) {
      extensionIsConfigured = get(GitlabAPI.isConfigured);
    }
  }
</script>

<!-- TODO: Consider Roboto font. It is more condensed and can fit -->
<!--       more text in the same space. -->
<div style:font-family="Poppins, sans-serif" >
  {#if extensionIsConfigured !== undefined}
    {#if extensionIsConfigured}
      <div class="p-3" class:popup-mode={isPopup()}>
        <Inbox />
      </div>
    {:else}
      <div class="p-3">
        <GitlabConfiguration />
      </div>
    {/if}
  {/if}
</div>

<style>
  /* 800x600 is maximum extension's popup size. We statically set */
  /* the popup's size to avoid ugly dynamic resizing shenanigans. */
  /* Also leaving some space for the scrollbars. */
  .popup-mode {
    width: 780px;
    height: 580px;
  }
</style>

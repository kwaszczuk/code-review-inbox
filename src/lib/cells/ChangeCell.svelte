<script>
  import { isPopup } from '$lib/utils';

  export let link;
  export let ref;

  // Shorten Merge Request's reference when in the popup mode.
  $: {
    if (isPopup()) {
      ref = ref.split('/').slice(-1).join('/');
    }
  }
</script>

<a href={link}>{@html ref.replaceAll('/', '/<wbr>').replace('!', '<wbr>!')}</a>

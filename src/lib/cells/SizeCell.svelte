<script>
  import { COLORS } from '$lib/colors.js';
  import LocTooltip from '$lib/cells/LocTooltip.svelte';

  export let changes = 0;
  export let additions = 0;
  export let deletions = 0;

  function formatSize(v) {
    const CHANGE_REQUEST_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

    const CHANGE_REQUEST_SIZE_TRESHOLDS = [3, 20, 80, 300, null];

    for (let i = 0; i < CHANGE_REQUEST_SIZES.length - 1; i++) {
      if (v <= CHANGE_REQUEST_SIZE_TRESHOLDS[i]) {
        return CHANGE_REQUEST_SIZES[i];
      }
    }
    return CHANGE_REQUEST_SIZES.slice(-1);
  }

  let size = formatSize(changes);

  let tooltipX;
  let tooltipY;

  function mouseOver(event) {
    if (!event.target.classList.contains('locTooltip')) {
      return;
    }

    let { left, right, bottom } = event.target.getBoundingClientRect();
    tooltipX = (left + right) / 2;
    tooltipY = bottom;
  }
</script>

<div
  on:mouseover={mouseOver}
  class="locTooltip text-center"
  style:--line-additions-default-color={COLORS.Green}
  style:--line-deletions-default-color={COLORS.Red}
>
  {size}
  <span style="top: {tooltipY}px; left: {tooltipX}px;" class="locTooltipText">
    <span class="lineAdditions">+{additions}</span>
    <span class="lineDeletions">-{deletions}</span>
  </span>
</div>

<style>
  .lineAdditions {
    font-weight: bold;
    color: var(--line-additions-default-color);
  }

  .lineDeletions {
    font-weight: bold;
    color: var(--line-deletions-default-color);
  }

  .locTooltip:hover {
    cursor: help;
  }

  .locTooltip .locTooltipText {
    visibility: hidden;
    border: 1px solid #ddd;
    box-shadow: 1px 1px 1px #ddd;
    background: white;
    border-radius: 4px;
    padding: 4px;
    position: absolute;

    opacity: 0;
    transition-duration: 0.5s;
  }

  .locTooltip:hover .locTooltipText {
    visibility: visible;
    opacity: 1;
    transition-delay: 0.5s;
  }
</style>

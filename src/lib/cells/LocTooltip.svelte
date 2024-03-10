<script>
  export let additions;
  export let deletions;
  let isHovered = false;
  let x;
  let y;

  function mouseOver(event) {
    isHovered = true;
    let { left, right, bottom } = event.target.getBoundingClientRect();
    x = (left + right) / 2;
    y = bottom;
  }
  function mouseLeave() {
    isHovered = false;
  }
</script>

<div on:mouseover={mouseOver} on:mousemove={mouseMove}>
  <slot />
</div>

{#if isHovered}
  <div style="top: {y}px; left: {x}px;" class="mytooltip">
    (<span class:lineAdditions={true}>+{additions}</span>
    <span class:lineDeletions={true}>-{deletions}</span>)
  </div>
{/if}

<style>
  .mytooltip {
    border: 1px solid #ddd;
    box-shadow: 1px 1px 1px #ddd;
    background: white;
    border-radius: 4px;
    padding: 4px;
    position: absolute;
  }
</style>

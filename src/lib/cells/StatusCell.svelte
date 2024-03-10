<script>
  import { COLORS } from '$lib/colors.js';
  import { ChangeRequestStatus } from '$lib/change_request.js';

  const STATUS_COLORS = {
    [ChangeRequestStatus.Draft]: COLORS.Grey,
    [ChangeRequestStatus.Unresolved]: COLORS.Orange,
    [ChangeRequestStatus.Pending]: COLORS.Orange,
    [ChangeRequestStatus.LGTM]: COLORS.Green,
  };

  // @type: ChangeRequestStatus
  export let status;
  let signColor;
  $: signColor = STATUS_COLORS[status];
</script>

<div style:display="flex">
  <i
    class="me-1"
    class:bi-check-square-fill={status === ChangeRequestStatus.LGTM}
    class:bi-square-fill={status === ChangeRequestStatus.Pending}
    class:bi-slash-square-fill={status === ChangeRequestStatus.Draft ||
      status === ChangeRequestStatus.Unresolved}
    style:color={signColor}
  />
  {status}
</div>

<style>
</style>

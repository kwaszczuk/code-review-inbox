<script>
  import Table from '$lib/Table.svelte';
  import ChangeRequestStore from '$lib/stores/change_requests';
  import GitlabStores from '$lib/stores/gitlab';
  import { formatTimeAgo } from '$lib/utils';
  import { ChangeRequestStatus } from './change_request';
  import { isPopup } from '$lib/utils';

  // TODO: Pass this as a prop
  export let inPopup = true;

  let gitlabUser = GitlabStores.currentUser;

  let changeRequests = null;
  let user = null;
  $: {
    user = $gitlabUser;
    changeRequests = $ChangeRequestStore;
  }

  let userRefreshTime = gitlabUser.refreshTime;
  let crsRefreshTime = ChangeRequestStore.refreshTime;

  function refreshAll() {
    gitlabUser.refresh();
    ChangeRequestStore.refresh();
  }

  // When the data was not yet fetched we need to acquire it e.g.
  // if it is the first time extension is used.
  // TODO: How to do this smarter?
  setTimeout(() => {
    if (changeRequests === null) {
      refreshAll();
    }
  }, 5000);

  function dashboardClick() {
    // TODO: Add Firefox support
    chrome.runtime.openOptionsPage();
  }
</script>

<div style:font-size={isPopup() ? '11px' : '12px'} style:cursor="default">
  <div class="flex">
    <div class="d-flex flex-row justify-content-between">
      <div>
        <h1 class="fs-1 fw-bold">Code Review Inbox</h1>
      </div>
      <div class="text-end">
        {#if user}
          <div>
            <b>User:</b>
            {user}
          </div>
          <div>
            <b>Last user refresh:</b>
            {formatTimeAgo($userRefreshTime)}
          </div>
          <div>
            <b>Last MRs refresh:</b>
            {formatTimeAgo($crsRefreshTime)}
          </div>
        {:else}
          Loading user info...
        {/if}
      </div>
    </div>

    <div class="d-flex flex-row justify-content-between">
      <button
        disabled={!inPopup}
        class="btn btn-sm btn-light border-secondary border-opacity-25"
        on:click={dashboardClick}
      >
        Dashboard
      </button>
      <button class="btn btn-sm btn-light border-secondary border-opacity-25" on:click={refreshAll}
        >Refresh</button
      >
    </div>

    <hr class="hr hr-blurry" />

    <div>
      {#if changeRequests && user}
        <Table
          title="Needs attention"
          data={changeRequests.filter((cr) =>
            cr.attentionSet.some((u) => u.username === user)
          )}
          whoami={user}
        />
        <hr class="hr hr-blurry" />
        <Table
          title="Incoming reviews"
          data={changeRequests.filter((cr) =>
            cr.reviewers.some((u) => u.username === user)
          )}
          whoami={user}
        />
        <hr class="hr hr-blurry" />
        <Table
          title="Outgoing reviews"
          data={changeRequests.filter(
            (cr) =>
              cr.status !== ChangeRequestStatus.Draft &&
              cr.authors.some((u) => u.username === user)
          )}
          whoami={user}
        />
        <hr class="hr hr-blurry" />
        <Table
          title="Your drafts"
          data={changeRequests.filter(
            (cr) =>
              cr.status === ChangeRequestStatus.Draft &&
              cr.authors.some((u) => u.username === user)
          )}
          whoami={user}
        />
      {:else}
        Loading change requests...
      {/if}
    </div>
  </div>
</div>

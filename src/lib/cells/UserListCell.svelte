<script>
  import { COLORS } from '$lib/colors.js';
  import ChangeRequestStore from '$lib/stores/change_requests.js';

  export let users = [];
  export let approvers = [];
  export let attentionSet = [];
  export let crRef = '';

  let userlist = {};
  let lastIdx = 0;
  $: {
    userlist = {};
    lastIdx = users.length - 1;
    for (let user of users) {
      const username = user.username;
      userlist[username] = {
        username,
        isApprover: approvers.some((u) => u.username === username),
        inAttentionSet: attentionSet.some((u) => u.username === username),
      };
    }
  }

  let hasBeenClicked = false;
  function handleAttentionSet(e, username) {
    // Prevent from spamming clicks
    if (hasBeenClicked) return;
    hasBeenClicked = true;
    e.target.style.setProperty('cursor', 'default');
    setTimeout(() => {
      hasBeenClicked = false;
      e.target.style.removeProperty('cursor');
    }, 500);

    // userlist[user].inAttentionSet = !userlist[user].inAttentionSet;
    const user = users.find((u) => u.username === username);
    if (attentionSet.some((u) => u.username == user.username)) {
      attentionSet = attentionSet.filter((u) => u.username !== user.username);
    } else {
      attentionSet.push(user);
      attentionSet = attentionSet;
    }
    ChangeRequestStore.updateAttentionSet(crRef, attentionSet);
  }
</script>

<div
  class="userlist"
  style:--user-default-color={COLORS.Black}
  style:--user-approver-color={COLORS.Green}
>
  {#each Object.values(userlist) as { username, isApprover, inAttentionSet }, idx}
    <div>
      <span
        class="user"
        class:inAttentionSet
        class:isApprover
        on:dblclick|preventDefault={(e) => handleAttentionSet(e, username)}
        on:mousedown|preventDefault={() => {}}
        role="presentation">{username}</span
      >{#if idx < lastIdx},{/if}
    </div>
  {/each}
</div>

<style>
  .userlist {
    font-weight: normal;
    color: var(--user-default-color);
  }

  .user {
    outline: 2px solid transparent;
    cursor: pointer;
    border-radius: 4px;

    transition-duration: 0.5s;
    transition-property: background-color, outline-color;
  }

  .user:hover,
  .user:focus {
    background-color: bisque;
    outline-color: bisque;

    transition-delay: 0.25s;
  }

  .inAttentionSet {
    font-weight: bold;
  }

  .isApprover {
    color: var(--user-approver-color);
  }
</style>

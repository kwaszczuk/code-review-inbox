import { ChangeRequest } from '$lib/change_request.js';
import GitlabAPI from '$lib/apis/gitlab.js';
import { writable, readonly, derived, get } from 'svelte/store';
import GitlabStores from '$lib/stores/gitlab';

const changeRequests = derived(readonly(GitlabStores.mergeRequests), ($v) => {
  if ($v === null) {
    return null;
  }
  return $v.map(ChangeRequest.fromGitlabMR);
});

const attentionSetChanges = writable({});
let attentionLastUpdate = null;

const store = derived(
  [changeRequests, attentionSetChanges],
  ([$core, $changes]) => {
    for (let i in $core) {
      let ref = $core[i].ref;
      if (ref in $changes) {
        $core[i].attentionSet = $changes[ref];
      }
    }
    return $core;
  }
);

async function applyAttentionSetChange(crRef, newAttentionSet) {
  const mr = get(GitlabStores.mergeRequests).find(
    (mr) => mr.references.full === crRef
  );
  await GitlabAPI.client.MergeRequests.edit(mr.project_id, mr.iid, {
    assigneeIds: newAttentionSet.map((u) => u.id),
  });
  // TODO: display notification about applied changes
}

export default {
  subscribe: store.subscribe,
  refreshTime: GitlabStores.mergeRequests.refreshTime,

  refresh() {
    attentionSetChanges.set({});
    GitlabStores.mergeRequests.refresh();
  },

  updateAttentionSet(crRef, newValue) {
    attentionSetChanges.update((v) => {
      v[crRef] = newValue;

      const curTime = Date.now();
      attentionLastUpdate = curTime;

      // Apply only if in last 5 seconds there was no other update.
      // It avoids applying prematurely e.g. if a change was made by accident.
      setTimeout(() => {
        if (attentionLastUpdate !== curTime) {
          return;
        }
        console.log(
          `Updating attention set for ${Object.keys(v).length} merge requests...`
        );
        Promise.all(
          Object.entries(v).map(async ([key, value]) => {
            await applyAttentionSetChange(key, value);
            attentionSetChanges.update((v) => {
              delete v[key];
              return v;
            });
          })
        )
          .then(() =>
            console.log('Attention set changes successfully updated!')
          )
          .catch((err) =>
            console.error('Error while applying attention set changes:', err)
          )
          .finally(() => {
            GitlabStores.mergeRequests.refresh();
            // TODO: display notification about update
          });
      }, 5000);

      return v;
    });
  },
};

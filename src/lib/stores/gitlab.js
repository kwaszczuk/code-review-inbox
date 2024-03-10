import { refreshableStore } from '$lib/stores/storables';
import { get } from 'svelte/store';
import GitlabAPI from '$lib/apis/gitlab';

async function getGitlabCurrentUser() {
  return GitlabAPI.client.Users.showCurrentUser().then((u) => u.username);
}
export const currentUser = refreshableStore(
  'gitlab_user',
  getGitlabCurrentUser
);

async function addApproversInfo(mr) {
  const approvalState =
    await GitlabAPI.client.MergeRequestApprovals.showApprovalState(
      mr.project_id,
      mr.iid
    );
  let approversMap = {};
  for (let rule of approvalState.rules) {
    for (let user of rule.approved_by) {
      approversMap[user.id] = user;
    }
  }
  mr.extras.approvers = Object.values(approversMap);
  return mr;
}

async function addLastActionInfo(mr) {
  const notes = await GitlabAPI.client.MergeRequestNotes.all(
    mr.project_id,
    mr.iid,
    { orderBy: 'created_at', sort: 'desc', perPage: 1, maxPages: 1 }
  );
  mr.extras.last_action = notes[0];
  return mr;
}

async function addExtraField(mr) {
  mr.extras = {};
  return mr;
}

async function addDiffStats(mr) {
  const query = `{
    mergeRequest(id: "gid://gitlab/MergeRequest/${mr.id}") {
      diffStatsSummary {
        additions
        deletions
        changes
      }
    }
  }`;
  const response = await GitlabAPI.client.requester.post('/api/graphql', {
    body: { query },
  });
  mr.extras.diff_stats = response.body.data.mergeRequest.diffStatsSummary;
  return mr;
}

async function enrichMergeRequest(mr) {
  return new Promise((resolve) => resolve(mr))
    .then(addExtraField)
    .then(addApproversInfo)
    .then(addLastActionInfo)
    .then(addDiffStats);
}

function dependsOnCurrentUser(mr) {
  const username = get(currentUser);
  return (
    mr.author.username === username ||
    mr.reviewers.some((a) => a.username === username)
  );
}

async function getGitlabMergeRequests() {
  return GitlabAPI.client.MergeRequests.all({
    state: 'opened',
    sort: 'desc',
    orderBy: 'updated_at',
    scope: 'all',
  }).then((mrs) =>
    Promise.all(mrs.filter(dependsOnCurrentUser).map(enrichMergeRequest)).catch(
      (err) => console.error('Error while enriching merge request:', err)
    )
  );
}

export const mergeRequests = refreshableStore(
  'gitlab_merge_requests',
  getGitlabMergeRequests
);

export default {
  currentUser,
  mergeRequests,
};

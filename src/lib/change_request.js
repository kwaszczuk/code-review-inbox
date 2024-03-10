/**
 * Enum for possible status of ChangeRequest
 * @readonly
 * @enum {string}
 */
export const ChangeRequestStatus = {
  Draft: 'Draft',
  Pending: 'Pending',
  Unresolved: 'Unresolved',
  LGTM: 'LGTM',
};

export class ChangeRequest {
  constructor({
    iid = '',
    project_id = '',
    ref = '',
    link = '',
    authors = [],
    reviewers = [],
    approvers = [],
    attentionSet = [],
    title = '',
    diffStats = {},
    lastAction = { date: null, user: '' },
  }) {
    this.iid = iid;
    this.project_id = project_id;
    this.ref = ref;
    this.link = link;
    this.authors = authors;
    this.reviewers = reviewers;
    this.approvers = approvers;
    this.attentionSet = attentionSet;
    this.title = title;
    this.diffStats = diffStats;
    this.lastActionDate = lastAction.date;
    this.lastActionUser = lastAction.user;
  }

  /**
   * @param {MergeRequestSchema} mr
   * @returns {ChangeRequest}
   */
  static fromGitlabMR(mr) {
    function mapUser(userObj) {
      return { username: userObj.username, id: userObj.id };
    }

    return new ChangeRequest({
      iid: mr.iid,
      project_id: mr.project_id,
      ref: mr.references.full,
      link: mr.web_url,
      authors: [mapUser(mr.author)],
      reviewers: mr.reviewers.map(mapUser),
      approvers: mr.extras.approvers.map(mapUser),
      attentionSet: mr.assignees.map(mapUser),
      title: mr.title,
      diffStats: mr.extras.diff_stats,
      lastAction: {
        date: new Date(Date.parse(mr.extras.last_action.created_at)),
        user: mr.extras.last_action.author.username,
      },
    });
  }

  /**
   * @returns {ChangeRequestStatus}
   */
  get status() {
    if (this.title.startsWith('Draft: ')) {
      return ChangeRequestStatus.Draft;
    }
    if (
      this.reviewers.some((reviewer) =>
        this.approvers.some(
          (approver) => reviewer.username === approver.username
        )
      )
    ) {
      return ChangeRequestStatus.LGTM;
    }
    return ChangeRequestStatus.Pending;
  }

  /**
   * @returns {string}
   */
  get lastAction() {
    return `${this.lastActionDate.toLocaleString('en-us', { day: 'numeric', month: 'short', year: 'numeric' })} by ${this.lastActionUser}`;
  }

  /**
   * @returns {number}
   */
  get changedLines() {
    return this.diffStats.changes || 0;
  }
}

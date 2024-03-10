<script>
  import { titleCase } from '$lib/utils.js';
  import { ChangeRequestStatus } from '$lib/change_request';
  import {
    ChangeCell,
    StatusCell,
    TextCell,
    SizeCell,
    UserListCell,
  } from '$lib/cells';

  // @type: string
  export let title;
  // @type: ChangeRequest[]
  export let data = [];
  // @type: string
  export let whoami;
  // @type: string
  export let collapseId = `collapse${titleCase(title)}`;

  $: data.sort((a, b) => {
    if (a.status === ChangeRequestStatus.LGTM) {
      return -1;
    } else if (b.status === ChangeRequestStatus.LGTM) {
      return 1;
    } else if (a.status === ChangeRequestStatus.Draft) {
      return 1;
    } else if (b.status === ChangeRequestStatus.Draft) {
      return -1;
    }
    return 0;
  });

  let columns = [
    {
      title: 'Change',
      component: ChangeCell,
      args: (cr) => ({ link: cr.link, ref: cr.ref }),
      width: '20%',
    },
    {
      title: 'Author',
      component: UserListCell,
      args: (cr) => ({
        users: cr.authors,
        attentionSet: cr.attentionSet,
        crRef: cr.ref,
      }),
      width: '10%',
    },
    {
      title: 'Status',
      component: StatusCell,
      args: (cr) => ({ status: cr.status }),
      width: '10%',
    },
    {
      title: 'Last Action',
      component: TextCell,
      args: (cr) => ({ value: cr.lastAction }),
      width: '15%',
    },
    {
      title: 'Reviewers',
      component: UserListCell,
      args: (cr) => ({
        users: cr.reviewers,
        attentionSet: cr.attentionSet,
        approvers: cr.approvers,
        crRef: cr.ref,
      }),
      width: '10%',
    },
    {
      title: 'Size',
      component: SizeCell,
      args: (cr) => ({ ...cr.diffStats }),
      width: '5%',
    },
    {
      title: 'Description',
      component: TextCell,
      args: (cr) => ({ value: cr.title }),
      width: '30%',
    },
  ];
</script>

<div>
  <div
    data-bs-toggle="collapse"
    href="#{collapseId}"
    role="button"
    aria-expanded="false"
    aria-controls={collapseId}
    class="fs-6"
  >
    <b>{title}</b>
    {data.length} changes
  </div>
  <div
    class="collapse"
    id={collapseId}
    class:show={title === 'Needs attention'}
  >
    <!-- TODO: table-sm may not be necessary -->
    <table class="table table-sm table-striped align-middle">
      <thead class="table-primary">
        <tr>
          {#each columns as column}
            <th style:width={column.width}>{column.title}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each Object.values(data) as cr}
          <tr
            class:cr-needs-attention={cr.attentionSet.some(
              (u) => u.username === whoami
            )}
          >
            {#each columns as column}
              <td style:width={column.width} style:overflow-wrap="break-word">
                <svelte:component
                  this={column.component}
                  {...column.args(cr)}
                />
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .cr-needs-attention {
    font-weight: var(--mark-row, bold);
  }
</style>

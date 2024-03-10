<script>
  import GitlabAPI from "$lib/apis/gitlab";

  let gitlabUrl = "https://";
  let gitlabToken = null;
  let error = "";
  let configureInProgress = false;

  function handleSubmit(e) {
    e.target.classList.add("was-validated");

    if (!e.target.checkValidity()) {
      return;
    }

    error = "";
    configureInProgress = true;
    GitlabAPI.configure(gitlabUrl, gitlabToken)
      .then(() => {
        configureInProgress = false;
      })
      .catch((err) => {
        error = err.message;
        configureInProgress = false;
        e.target.classList.remove("was-validated");
      });
  }

  function showHideToken(e) {
    let input = document.getElementById("gitlab-token");
    if (input.type === "password") {
      input.type = "text";
      e.target.classList.remove("bi-eye-slash-fill");
      e.target.classList.add("bi-eye-fill");
    } else {
      input.type = "password";
      e.target.classList.remove("bi-eye-fill");
      e.target.classList.add("bi-eye-slash-fill");
    }
  }
</script>

<!-- 780px is an exact size of the popup. -->
<!-- TODO: Maybe we could set a width in the parent? -->
<div style:width="500px">
  <form
    on:submit|preventDefault={handleSubmit}
    class="d-flex row gy-3 gx-0"
    novalidate
  >
    <span class="lead text-center">
      <strong
        >To use Code Review Inbox, you first need to configure Gitlab
        connection:</strong
      >
    </span>

    <div class="form-floating">
      <input
        type="url"
        class="form-control"
        id="gitlab-url"
        bind:value={gitlabUrl}
        placeholder="https://"
        required
      />
      <label for="gitlab-url">Gitlab URL</label>
    </div>

    <div class="input-group">
      <div class="form-floating">
        <input
          type="password"
          class="form-control"
          id="gitlab-token"
          bind:value={gitlabToken}
          placeholder=""
          required
        />
        <label for="gitlab-token">Gitlab Personal Access Token</label>
      </div>
      <span class="input-group-text">
        <i
          class="bi bi-eye-slash-fill"
          style:cursor="pointer"
          on:click={showHideToken}
        ></i>
      </span>
    </div>

    <div>
      {#if configureInProgress}
        <button class="btn btn-primary" disabled>
          <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"
          ></span>
          <span role="status">Configuring...</span>
        </button>
      {:else}
        <button class="btn btn-primary"> Configure </button>
      {/if}
    </div>

    {#if error}
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <h6 class="alert-heading">Failed to configure Gitlab connection!</h6>
        <hr />
        <p class="mb-0">{error}</p>

        <button
          type="button"
          class="btn btn-close btn-sm"
          data-bs-dismiss="alert"
          aria-label="Close"
        ></button>
      </div>
    {/if}
  </form>
</div>

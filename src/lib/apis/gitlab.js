import LocalStorageHelper from '$lib/local_storage_helper';
import { Gitlab } from '@gitbeaker/rest';
import { isBrowser } from '$lib/utils';
import { persistentStore } from '$lib/stores/storables';
import { get, derived } from 'svelte/store';

class ClientUnconfiguredError extends Error {
  constructor(clientName) {
    super(`${clientName} is unconfigured.`);
    this.name = 'ClientUnconfiguredError';
  }
}

class _GitlabAPI {
  constructor() {
    this._gitlabHost = persistentStore('gitlab_host');
    this._gitlabToken = persistentStore('gitlab_token');
    console.debug('Current gitlab host:', get(this._gitlabHost));
    console.debug('Current gitlab token:', get(this._gitlabToken));
  }

  get isConfigured() {
    return derived([this._gitlabHost, this._gitlabToken], ([$host, $token]) => {
      return isBrowser() && $host !== null && $token !== null;
    });
  }

  getClient() {
    if (!this.isConfigured) {
      throw new ClientUnconfiguredError('Gitlab API');
    }

    return new Gitlab({
      host: get(this._gitlabHost),
      token: get(this._gitlabToken),
    });
  }

  get client() {
    return this.getClient();
  }

  async configure(host, token, { force = false } = {}) {
    if (!force) {
      // Check if provided configuration is correct.
      try {
        await new Gitlab({ host, token }).Metadata.show();
      } catch (err) {
        console.error(err);
        throw Error(`Couldn't query Gitlab metadata - ${err.message}`);
      }
    }

    console.log('Configured gitlab api');
    this._gitlabHost.set(host);
    this._gitlabToken.set(token);
  }

  async unconfigure() {
    await this.configure(null, null, { force: true });
  }
}

const _api = new _GitlabAPI();
export default _api;

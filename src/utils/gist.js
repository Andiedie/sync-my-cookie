import axios from 'axios';
import storage from './storage';
import aes from 'crypto-js/aes';
import UTF8 from 'crypto-js/enc-utf8';
let options, ax;

export default {
  init (opt) {
    options = opt;
    ax = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `token ${options.token}`,
        'Cache-Control': 'no-cache'
      }
    });
  },

  async checkOAuthScope () {
    try {
      const { headers } = await ax.get('/');
      if (!headers['x-oauth-scopes'].includes('gist')) {
        throw new Error('Token verification failed：\nThe OAuth scopes of token must contain "gist"');
      }
    } catch (err) {
      if (err.response) {
        throw new Error('Invalid Token');
      }
      throw err;
    }
  },

  async checkGistId () {
    try {
      await ax.patch(`/gists/${options.gistid}`, {
        description: 'Sync-My-Cookie'
      });
    } catch (err) {
      if (err.response) {
        throw new Error('Invalid Id');
      }
      throw err;
    }
  },

  async createGist (raw = '[]') {
    const { data } = await ax.post('/gists', {
      description: 'Sync-My-Cookie',
      files: {
        sync_my_cookie: {
          content: aes.encrypt(raw, options.secret).toString()
        }
      }
    });
    return data.id;
  },
  async pull () {
    let data;
    try {
      ({ data } = await ax.get(`/gists/${options.gistid}`));
    } catch (err) {
      if (err.response && err.response.status === 404) {
        options.gistid = await this.createGist();
        await storage.save(options);
        return '[]';
      } else {
        throw err;
      }
    }
    if (!data.files.sync_my_cookie) return '[]';
    if (data.files.sync_my_cookie.size === 0) return '[]';
    if (data.files.sync_my_cookie.truncated) {
      ({ data } = await ax.get(data.files.sync_my_cookie.raw_url));
    } else {
      data = data.files.sync_my_cookie.content;
    }
    try {
      const buffer = aes.decrypt(data, options.secret);
      if (buffer.sigBytes < 0) throw Error('Secret Wrong!');
      return buffer.toString(UTF8);
    } catch (err) {
      throw Error('Secret Wrong!');
    }
  },

  async push (raw) {
    const encrypted = aes.encrypt(raw, options.secret).toString();
    try {
      await ax.patch(`/gists/${options.gistid}`, {
        files: {
          sync_my_cookie: {
            content: encrypted
          }
        }
      });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        options.gistid = await this.createGist(raw);
        await storage.save(options);
      } else {
        throw err;
      }
    }
  }
};

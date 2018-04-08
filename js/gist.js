gist = {
  option: {},
  ax: null,

  init (option) {
    this.option = option;
    this.ax = axios.create({
      baseURL: 'https://api.github.com',
      headers: { Authorization: `token ${this.option.token}` }
    });
  },

  async checkOAuthScope () {
    try {
      const { headers } = await this.ax.get('/');
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
      await this.ax.patch(`/gists/${this.option.gistid}`, {
        description: 'Sync-My-Cookie'
      });
    } catch (err) {
      if (err.response) {
        throw new Error('Invalid Id');
      }
      throw err;
    }
  },

  async createGist () {
    await this.ax.post('/gists', {
      description: 'Sync-My-Cookie',
      files: {
        sync_my_cookie: {
          content: CryptoJS.AES.encrypt('[]', this.option.secret).toString()
        }
      }
    });
  },
  // TODO: bean deleted
  async pull () {
    let { data } = await this.ax.get(`/gists/${this.option.gistid}`);
    if (!data.files.sync_my_cookie) return '[]';
    if (data.files.sync_my_cookie.size === 0) return '[]';
    if (data.files.sync_my_cookie.truncated) {
      ({ data } = await this.ax.get(data.files.sync_my_cookie.raw_url));
    } else {
      data = data.files.sync_my_cookie.content;
    }
    const buffer = CryptoJS.AES.decrypt(data, this.option.secret);
    if (buffer.sigBytes < 0) throw Error('Secret Wrong!');
    return buffer.toString(CryptoJS.enc.Utf8);
  },

  async push (raw) {
    const encrypted = CryptoJS.AES.encrypt(raw, this.option.secret).toString();
    await this.ax.patch(`/gists/${this.option.gistid}`, {
      files: {
        sync_my_cookie: {
          content: encrypted
        }
      }
    });
  }
};

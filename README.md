# SyncMyCookie

SyncMyCookie is a chrome extension to synchronize your cookies.

## Install
- Recommanded: [Chrome Web Store](https://chrome.google.com/webstore/detail/syncmycookie/laapobniolmbhnkldepjnebendehhmmf)
- [SyncMyCookie.crx]()
- [Pre Built]()

  Enable the `Developer mode` in the Chrome Extension(`chrome://extensions`) and load it via `Load Upacked`.
  
- [Build from Source]()

  ```bash
  git clone https://github.com/Andiedie/sync-my-cookie.git
  cd sync-my-cookie
  yarn            # npm install
  yarn build      # npm run build
  ```
  And load folder `build` just like the above method.
  
## Configuration
In order to share cookies across devices, this extension encrypts your cookies and save them in Gist, which requires you to have a GitHub account.
If you have suggestions for using other types of storage to save data, please create an issue [here](https://github.com/Andiedie/sync-my-cookie/issues).

### Generate GitHub Access Token

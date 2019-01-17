import React, { Component } from 'react';
const style = require('./index.scss');

import Console from '../console';
import Domains from '../domain-list';
import Setting, { Options as SettingOptions } from '../setting';

import { Kevast } from 'kevast';
import { KevastChromeLocal, KevastChromeSync } from 'kevast-chrome';
import { KevastEncrypt } from 'kevast-encrypt';
import { KevastGist } from 'kevast-gist';
import { Pair } from 'kevast/dist/Pair';
import * as chromeUtils from '../../utils/chrome';
import { getDomain } from '../../utils/util';

const DOMAIN_LIST_KEY = '__DOMAIN_LIST_';

interface State {
  isSetting: boolean;
  currentDomain: string;
  currentUrl: string;
  autoPush: boolean;
  autoMerge: boolean;
  domainList: string[];
}

class Popup extends Component<{}, State> {
  private gist: Kevast;
  private chromeLocal: Kevast;
  private chromeSync: Kevast;
  public constructor(prop: {}) {
    super(prop);
    this.gist = new Kevast(new KevastChromeLocal());
    this.chromeLocal = new Kevast(new KevastChromeLocal());
    this.chromeSync = new Kevast(new KevastChromeSync());
    this.state = {
      isSetting: false,
      currentDomain: '',
      currentUrl: '',
      autoMerge: false,
      autoPush: false,
      domainList: [],
    };
  }
  public render() {
    return this.state.isSetting ? (
      <div className={style.wrapper}>
        <Setting onSet={this.handleSet} />
      </div>
    ) : (
      <div className={style.wrapper}>
        <Console
          domain={this.state.currentDomain}
          autoMerge={this.state.autoMerge}
          autoPush={this.state.autoPush}
          canMerge={this.state.domainList.includes(this.state.currentDomain)}
          onMerge={this.handleMerge}
          onPush={this.handlePush}
        />
        <Domains
          domains={this.state.domainList}
          currentDomain={this.state.currentDomain}
        />
      </div>
    );
  }

  public async componentDidMount() {
    const url = await chromeUtils.getCurrentTabUrl();
    this.setState({
      currentDomain: getDomain(url),
      currentUrl: url,
    });

    this.initGist();
  }

  private handleMerge = async () => {
    const savedCookie = JSON.parse(await this.gist.get(this.state.currentDomain) || '[]');
    await chromeUtils.importCookies(savedCookie);
    alert('Merged');
  }

  private handlePush = async () => {
    const cookies = await chromeUtils.exportCookies(this.state.currentUrl);
    const domainList = [...this.state.domainList];
    domainList.unshift(this.state.currentDomain);
    await this.gist.bulkSet([
      {key: DOMAIN_LIST_KEY, value: JSON.stringify(domainList)},
      {key: this.state.currentDomain, value: JSON.stringify(cookies)},
    ]);
    this.setState({
      domainList,
    });
    alert('Pushed');
  }

  private handleSet = async (options: SettingOptions) => {
    const bulk: Pair[] = [
      {key: 'token', value: options.token},
      {key: 'password', value: options.password},
    ];
    if (options.gistId) {
      bulk.push({key: 'gistId', value: options.gistId});
    }
    if (options.filename) {
      bulk.push({key: 'filename', value: options.filename});
    }
    await this.chromeSync.bulkSet(bulk);
    this.setState({
      isSetting: false,
    });
    this.initGist();
  }

  private async initGist() {
    const token = await this.chromeSync.get('token');
    const password = await this.chromeSync.get('password');
    if (!token || !password) {
      this.setState({
        isSetting: true,
      });
      return;
    }
    const gistId = await this.chromeSync.get('gistId');
    const filename = await this.chromeSync.get('filename');
    this.gist.add(new KevastGist(token, gistId, filename));
    this.gist.use(new KevastEncrypt(password));
    this.setState({
      autoPush: Boolean(await this.chromeLocal.get(`${this.state.currentDomain}_autoPush`)),
      autoMerge: Boolean(await this.chromeLocal.get(`${this.state.currentDomain}_autoMerge`)),
      domainList: JSON.parse(await this.gist.get(DOMAIN_LIST_KEY) || '[]'),
    });
  }
}

export default Popup;

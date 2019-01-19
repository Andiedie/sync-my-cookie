import React, {Component} from 'react';
import ReactDom from 'react-dom';
const style = require('./popup.module.scss');
import './global.scss';

import { Modal } from 'antd';
import Console from './components/console/console';
import Domains from './components/domain-list/domain-list';
import Setting from './components/setting/setting';

import * as chromeUtils from './utils/chrome';
import { auto, gist } from './utils/store';
import { getDomain, move2Front } from './utils/utils';

interface State {
  isSetting: boolean;
  currentDomain: string;
  domainList: string[];
  autoPush: boolean;
  autoMerge: boolean;
}

class Popup extends Component<{}, State> {
  public constructor(prop: {}) {
    super(prop);
    this.state = {
      isSetting: false,
      currentDomain: '',
      domainList: [],
      autoMerge: false,
      autoPush: false,
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
          canMerge={this.state.domainList.includes(this.state.currentDomain)}
          onMerge={this.handleMerge}
          onPush={this.handlePush}
          onAutoConfigChange={this.handleAutoConfigChange}
          autoPush={this.state.autoPush}
          autoMerge={this.state.autoMerge}
        />
        <Domains
          domains={this.state.domainList}
          currentDomain={this.state.currentDomain}
          onDomainChange={this.handleDomainChange}
          onDomainClose={this.handleDomainClose}
        />
      </div>
    );
  }

  public async componentDidMount() {
    const url = await chromeUtils.getCurrentTabUrl();
    const currentDomain = getDomain(url);
    const autoConfig = await auto.get(currentDomain);
    this.setState((prevState) => {
      return {
        ...autoConfig,
        currentDomain,
        domainList: move2Front(prevState.domainList, currentDomain),
      };
    });

    await this.initGist();
  }

  private handleAutoConfigChange = async (config: {autoPush: boolean, autoMerge: boolean}) => {
    await auto.set(this.state.currentDomain, config);
    this.setState(config);
  }

  private handleDomainClose = (domain: string) => {
    const that = this;
    return new Promise(((resolve) => {
      Modal.confirm({
        title: 'Delete',
        content: `Delete cookies under ${domain}`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        async onOk() {
          await auto.remove(domain);
          const domainList = await gist.remove(domain, that.state.domainList);
          that.setState({
            autoMerge: false,
            autoPush: false,
            domainList,
          });
          resolve();
        },
        onCancel() {
          resolve();
        },
      });
    }));
  }

  private handleDomainChange = async (domain: string) => {
    const autoConfig = await auto.get(domain);
    this.setState((prevState) => {
      return {
        ...autoConfig,
        currentDomain: domain,
        domainList: move2Front(prevState.domainList, domain),
      };
    });
  }

  private handleMerge = async () => {
    const savedCookie = await gist.getCookies(this.state.currentDomain);
    await chromeUtils.importCookies(savedCookie);
    Modal.success({
      title: 'Merged',
      content: `${savedCookie.length} cookies merged`,
    });
  }

  private handlePush = async () => {
    const cookies = await chromeUtils.exportCookies(this.state.currentDomain);
    if (cookies.length === 0) {
      Modal.info({
        title: 'Cancelled',
        content: `There is no cookie under ${this.state.currentDomain}`,
      });
      return;
    }
    const domainList = await gist.set([{
      domain: this.state.currentDomain,
      cookies,
    }], this.state.domainList);
    Modal.success({
      title: 'Pushed',
      content: `${cookies.length} cookies pushed`,
    });
    this.setState((prevState) => {
      return {
        domainList: move2Front(domainList, prevState.currentDomain),
      };
    });
  }

  private handleSet = async () => {
    this.setState({
      isSetting: false,
    });
    this.initGist();
  }

  private async initGist() {
    const ready = await gist.init();
    if (!ready) {
      this.setState({
        isSetting: true,
      });
      return;
    }
    const domainList = await gist.getDomainList();
    this.setState((prevState) => {
      return {
        domainList: move2Front(domainList, prevState.currentDomain),
      };
    });
  }
}

ReactDom.render(
  <Popup />,
  document.getElementById('root'),
);

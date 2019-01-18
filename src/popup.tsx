import React, {Component} from 'react';
import ReactDom from 'react-dom';
const style = require('./popup.scss');
import './global.scss';

import Console from './components/console/console';
import Domains from './components/domain-list/domain-list';
import Setting from './components/setting/setting';

import * as chromeUtils from './utils/chrome';
import * as keys from './utils/keys';
import { gist } from './utils/store';
import { getDomain } from './utils/utils';

interface State {
  isSetting: boolean;
  currentDomain: string;
  currentUrl: string;
  domainList: string[];
  isRunning: boolean;
}

class Popup extends Component<{}, State> {
  public constructor(prop: {}) {
    super(prop);
    this.state = {
      isSetting: false,
      currentDomain: '',
      currentUrl: '',
      domainList: [],
      isRunning: false,
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
          isRunning={this.state.isRunning}
        />
        <Domains
          domains={this.state.domainList}
          currentDomain={this.state.currentDomain}
          isRunning={this.state.isRunning}
          onDomainChange={this.handleDomainChange}
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

    await this.initGist();
    this.setState({ isRunning: false });
  }

  private handleDomainChange = (domain: string) => {
    const domainList = [domain, ...this.state.domainList.filter((one) => one !== domain)];
    this.setState({
      currentDomain: domain,
      domainList,
    });
  }

  private handleMerge = async () => {
    this.setState({ isRunning: true });
    const savedCookie = await gist.getCookies(this.state.currentDomain);
    await chromeUtils.importCookies(savedCookie);
    alert('Merged');
    this.setState({ isRunning: false });
  }

  private handlePush = async () => {
    this.setState({ isRunning: true });
    const cookies = await chromeUtils.exportCookies(this.state.currentUrl);
    let domainList = [...this.state.domainList];
    domainList = domainList.filter((domain) => domain !== this.state.currentDomain);
    domainList.unshift(this.state.currentDomain);
    await gist.set(domainList, this.state.currentDomain, cookies);
    this.setState({
      domainList,
      isRunning: false,
    });
    alert('Pushed');
  }

  private handleSet = async () => {
    this.setState({
      isSetting: false,
    });
    this.initGist();
  }

  private async initGist() {
    const result = await gist.init();
    if (!result) {
      this.setState({
        isSetting: true,
      });
      return;
    }
    this.setState({
      domainList: await gist.getDomainList(),
    });
  }
}

ReactDom.render(
  <Popup />,
  document.getElementById('root'),
);

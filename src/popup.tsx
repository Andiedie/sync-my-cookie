import React, {Component} from 'react';
import ReactDom from 'react-dom';
const style = require('./popup.scss');
import './global.scss';

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
  isRunning: boolean;
}

class Popup extends Component<{}, State> {
  public constructor(prop: {}) {
    super(prop);
    this.state = {
      isSetting: false,
      currentDomain: '',
      domainList: [],
      isRunning: true,
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
          onDomainClose={this.handleDomainClose}
        />
      </div>
    );
  }

  public async componentDidMount() {
    const url = await chromeUtils.getCurrentTabUrl();
    const currentDomain = getDomain(url);
    this.setState((prevState) => {
      return {
        currentDomain,
        domainList: move2Front(prevState.domainList, currentDomain),
      };
    });

    await this.initGist();
    this.setState({ isRunning: false });
  }

  private handleDomainClose = async (domain: string) => {
    await auto.remove(domain);
    const domainList = await gist.remove(domain, this.state.domainList);
    this.setState({
      domainList,
    });
  }

  private handleDomainChange = (domain: string) => {
    this.setState((prevState) => {
      return {
        currentDomain: domain,
        domainList: move2Front(prevState.domainList, domain),
      };
    });
  }

  private handleMerge = async () => {
    this.setState({ isRunning: true });
    const savedCookie = await gist.getCookies(this.state.currentDomain);
    await chromeUtils.importCookies(savedCookie);
    alert(`Merged ${savedCookie.length} cookies`);
    this.setState({ isRunning: false });
  }

  private handlePush = async () => {
    this.setState({ isRunning: true });
    const cookies = await chromeUtils.exportCookies(this.state.currentDomain);
    if (cookies.length === 0) {
      alert('There is no cookie under this domain');
    }
    const domainList = await gist.set([{
      domain: this.state.currentDomain,
      cookies,
    }], this.state.domainList);
    alert(`Push ${cookies.length} cookies`);
    this.setState((prevState) => {
      return {
        domainList: move2Front(domainList, prevState.currentDomain),
        isRunning: false,
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

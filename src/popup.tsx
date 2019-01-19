import React, {Component} from 'react';
import ReactDom from 'react-dom';
const style = require('./popup.module.scss');
import './global.scss';

import Console from './components/console/console';
import Domains from './components/domain-list/domain-list';
import Setting from './components/setting/setting';

import swal from 'sweetalert';
import * as chromeUtils from './utils/chrome';
import { auto, gist } from './utils/store';
import { getDomain, move2Front } from './utils/utils';

interface State {
  isSetting: boolean;
  currentDomain: string;
  domainList: string[];
  isRunning: boolean;
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
      isRunning: true,
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
          // domain={this.state.currentDomain}
          // canMerge={this.state.domainList.includes(this.state.currentDomain)}
          // onMerge={this.handleMerge}
          // onPush={this.handlePush}
          // onAutoConfigChange={this.handleAutoConfigChange}
          // autoPush={this.state.autoPush}
          // autoMerge={this.state.autoMerge}
          domain={'github.com'}
          canMerge={true}
          onMerge={this.handleMerge}
          onPush={this.handlePush}
          onAutoConfigChange={this.handleAutoConfigChange}
          autoPush={true}
          autoMerge={false}
        />
        <Domains
          // domains={this.state.domainList}
          // currentDomain={this.state.currentDomain}
          // onDomainChange={this.handleDomainChange}
          // onDomainClose={this.handleDomainClose}
          domains={['github.com', 'bilibili.com', 'bangumi.tv', 'gitlab.com', 'taobao.com']}
          currentDomain={'github.com'}
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
    this.setState({ isRunning: false });
  }

  private handleAutoConfigChange = async (config: {autoPush: boolean, autoMerge: boolean}) => {
    await auto.set(this.state.currentDomain, config);
    this.setState(config);
  }

  private handleDomainClose = async (domain: string) => {
    const confirm = await swal({
      title: 'Delete',
      text: `Delete cookies under ${domain}`,
      icon: 'warning',
      buttons: ['Cancel', 'OK'],
      dangerMode: true,
    });
    if (!confirm) {
      return;
    }
    this.setState({ isRunning: true });
    await auto.remove(domain);
    const domainList = await gist.remove(domain, this.state.domainList);
    this.setState({
      autoMerge: false,
      autoPush: false,
      domainList,
      isRunning: false,
    });
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
    this.setState({ isRunning: true });
    const savedCookie = await gist.getCookies(this.state.currentDomain);
    await chromeUtils.importCookies(savedCookie);
    swal({
      title: 'Merged',
      text: `${savedCookie.length} cookies merged`,
      icon: 'success',
    });
    this.setState({ isRunning: false });
  }

  private handlePush = async () => {
    this.setState({ isRunning: true });
    const cookies = await chromeUtils.exportCookies(this.state.currentDomain);
    if (cookies.length === 0) {
      swal({
        title: 'Cancelled',
        text: `There is no cookie under ${this.state.currentDomain}`,
        icon: 'info',
      });
      return;
    }
    const domainList = await gist.set([{
      domain: this.state.currentDomain,
      cookies,
    }], this.state.domainList);
    swal({
      title: 'Pushed',
      text: `${cookies.length} cookies pushed`,
      icon: 'success',
    });
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

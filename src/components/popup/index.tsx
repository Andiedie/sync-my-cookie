import React, { Component } from 'react';
const style = require('./index.scss');
import Console from '../console';
import Domains from '../domain-list';

interface State {
  domainList: string[];
}

class Popup extends Component<{}, State> {
  public constructor(prop: {}) {
    super(prop);
    this.state = {
      domainList: ['115.com', 'github.com', 'bilibili.com', 'iqiyi.com'],
    };
  }
  public render() {
    return (
      <div className={style.wrapper}>
        <Console />
        <Domains domains={this.state.domainList} />
      </div>
    );
  }
}

export default Popup;

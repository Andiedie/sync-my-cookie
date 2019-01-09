import React, { Component } from 'react';
const style = require('./index.scss');
import Console from '../console';
import SiteList from '../site-list';

class Popup extends Component {
  public render() {
    return (
      <div className={style.wrapper}>
        <Console domain={'115.com'} />
        <SiteList siteList={['115.com', 'github.com', 'bilibili.com', 'iqiyi.com', 'bangumi.tv']} />
      </div>
    );
  }
}

export default Popup;

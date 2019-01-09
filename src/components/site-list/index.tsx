import React, { Component } from 'react';
const style = require('./index.scss');
import Site from '../site';

interface Prop {
  siteList: string[];
}

class SiteList extends Component<Prop> {
  public render() {
    return (
      <div className={style.wrapper}>
        <div className={style.pointer} />
        {this.renderList(this.props.siteList)}
      </div>
    );
  }
  private renderList = (siteList: string[]) => {
    return siteList.map((domain, index) => {
      return (
        <Site
          key={domain}
          className={style.site}
          domain={domain}
          active={index === 0}
        />
      );
    });
  }
}

export default SiteList;

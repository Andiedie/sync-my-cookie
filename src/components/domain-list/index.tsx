import React, { Component } from 'react';
const style = require('./index.scss');
import Domain from '../domain';

interface Prop {
  domains: string[];
}

class DomainList extends Component<Prop> {
  public render() {
    return (
      <div className={style.wrapper}>
        <div className={style.pointer} />
        {this.renderList(this.props.domains)}
      </div>
    );
  }
  private renderList = (domains: string[]) => {
    return domains.map((domain, index) => {
      return (
        <Domain
          key={domain}
          className={style.domain}
          domain={domain}
          active={index === 0}
        />
      );
    });
  }
}

export default DomainList;

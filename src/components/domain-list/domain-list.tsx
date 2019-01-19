import React, { Component } from 'react';
const style = require('./domain-list.scss');
import Domain from '../domain/domain';

interface Prop {
  domains: string[];
  currentDomain: string;
  isRunning: boolean;
  onDomainChange?: (domain: string) => void;
  onDomainClose?: (domain: string) => void;
}

class DomainList extends Component<Prop> {
  public render() {
    return (
      <div className={style.wrapper}>
        {this.props.domains[0] === this.props.currentDomain && <div className={style.pointer} />}
        {this.renderList(this.props.domains, this.props.currentDomain)}
      </div>
    );
  }
  private renderList = (domains: string[], active: string) => {
    return domains.map((domain) => {
      return (
        <Domain
          key={domain}
          className={style.domain}
          domain={domain}
          active={domain === active}
          onClick={this.handleDomainClick}
          onClose={this.handleDomainClose}
        />
      );
    });
  }
  private handleDomainClick = (domain: string) => {
    if (this.props.onDomainChange) {
      this.props.onDomainChange(domain);
    }
  }
  private handleDomainClose = (domain: string) => {
    if (this.props.onDomainClose) {
      this.props.onDomainClose(domain);
    }
  }
}

export default DomainList;

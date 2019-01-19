import React, { Component } from 'react';
const style = require('./domain.module.scss');

interface Prop {
  domain: string;
  className?: string;
  active?: boolean;
  onClick?: (domain: string) => void;
  onClose?: (domain: string) => void;
}

class Domain extends Component<Prop> {
  public render() {
    return (
      <div className={this.props.className}>
        <div
          className={[style.wrapper, this.props.active ? style.active : undefined].join(' ')}
          onClick={this.handleClick}
          data-domain={this.props.domain}
        >
          <img
            className={style.img}
            src={`https://${this.props.domain}/favicon.ico`}
            alt='domain icon'
            onError={this.handleImageError}
          />
          <span className={style.domain}>
            {this.props.domain}
          </span>
          <div
            className={style.close}
            onClick={this.handleClose}
            data-domain={this.props.domain}
          >
            X
          </div>
        </div>
      </div>
    );
  }
  private handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    (e.target as HTMLImageElement).style.opacity = '0';
  }
  private handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const domain = event.currentTarget.dataset.domain;
    if (this.props.onClick && domain) {
      this.props.onClick(domain);
    }
  }
  private handleClose = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    const domain = event.currentTarget.dataset.domain;
    if (this.props.onClose && domain) {
      this.props.onClose(domain);
    }
  }
}

export default Domain;

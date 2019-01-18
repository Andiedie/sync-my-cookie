import React, { Component } from 'react';
const style = require('./domain.scss');
const X = require('react-feather/dist/icons/x').default;

interface Prop {
  domain: string;
  className?: string;
  active?: boolean;
  onClick?: (domain: string) => void;
}

class Domain extends Component<Prop> {
  public render() {
    return (
      <div className={this.props.className}>
        <div
          className={[style.wrapper, this.props.active ? style.active : undefined].join(' ')}
          onClick={this.handleClick}
          key={this.props.domain}
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
          <div className={style.close}>
            <X />
          </div>
        </div>
      </div>
    );
  }
  private handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    (e.target as HTMLImageElement).style.opacity = '0';
  }
  private handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (this.props.onClick) {
      this.props.onClick(event.currentTarget.dataset.domain || '');
    }
  }
}

export default Domain;

import React, { Component } from 'react';
const style = require('./index.scss');

interface Prop {
  mode?: 'outline' | 'fill';
  disable?: boolean;
  onClick?: () => void;
}

class Popup extends Component<Prop> {
  public render() {
    const mode = this.props.mode || 'fill';
    const className = [style.button, style[mode], this.props.disable && style.disable].join(' ');
    return (
      <div className={className} onClick={this.onClick}>
        {this.props.children}
      </div>
    );
  }
  private onClick = () => {
    if (!this.props.disable && this.props.onClick) {
      this.props.onClick();
    }
  }
}

export default Popup;

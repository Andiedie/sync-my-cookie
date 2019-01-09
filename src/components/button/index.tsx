import React, { Component } from 'react';
const style = require('./index.scss');

interface Prop {
  mode?: 'outline' | 'fill';
}

class Popup extends Component<Prop> {
  public render() {
    const mode = this.props.mode || 'fill';
    return (
      <div className={[style.button, style[mode]].join(' ')}>
        {this.props.children}
      </div>
    );
  }
}

export default Popup;

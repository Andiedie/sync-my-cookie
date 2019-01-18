import React, { Component } from 'react';
const style = require('./index.scss');

interface Prop {
  on?: boolean;
}

class Slider extends Component<Prop> {
  public render() {
    return (
      <div
        className={[style.wrapper, this.props.on && style.on].join(' ')}
        onClick={this.handleClick}
      >
        <div className={style.slider}/>
      </div>
    );
  }
  public handleClick = () => {
    alert('hello');
  }
}

export default Slider;

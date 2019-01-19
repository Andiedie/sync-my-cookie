import React, { Component } from 'react';
const style = require('./slider.scss');

interface Prop {
  on?: boolean;
  name: string;
  onTrigger: (name: string) => void;
  disable?: boolean;
}

class Slider extends Component<Prop> {
  public render() {
    const classes = [style.wrapper];
    if (this.props.on) {
      classes.push(style.on);
    }
    if (this.props.disable) {
      classes.push(style.disable);
    }
    return (
      <div
        className={classes.join(' ')}
        onClick={this.handleClick}
      >
        <div className={style.slider}/>
      </div>
    );
  }
  public handleClick = () => {
    if (this.props.onTrigger && !this.props.disable) {
      this.props.onTrigger(this.props.name);
    }
  }
}

export default Slider;

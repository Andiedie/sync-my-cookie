import React, { Component } from 'react';

const style = require('./console.scss');

import { Kevast } from 'kevast';
import { KevastChromeLocal } from 'kevast-chrome';
import { generateKey } from '../../utils/util';
import Button from '../button/button';
import Slider from '../slider/slider';

const UploadCloud = require('react-feather/dist/icons/upload-cloud').default;
const DownloadCloud = require('react-feather/dist/icons/download-cloud').default;
const Settings = require('react-feather/dist/icons/settings').default;
const { Textfit } = require('react-textfit');

interface Prop {
  domain: string;
  canMerge: boolean;
  onMerge: () => void;
  onPush: () => void;
  isRunning: boolean;
}

interface State {
  autoPush: boolean;
  autoMerge: boolean;
}

class Console extends Component<Prop, State> {
  private chromeLocal: Kevast;
  public constructor(prop: Prop) {
    super(prop);
    this.chromeLocal = new Kevast(new KevastChromeLocal());
    this.state = {
      autoPush: false,
      autoMerge: false,
    };
  }
  public render() {
    if (this.props.domain) {
      return (
        <div className={style.wrapper}>
          <Textfit
            className={style.domain}
            max={40}
          >
            {this.props.domain}
          </Textfit>
          <div className={style.sliders}>
            <div className={style.one}>
              <div className={style.secret}>
                <UploadCloud className={[style.upload, style.icon].join(' ')} />
                <Settings className={[style.setting, style.icon].join(' ')} />
              </div>
              <span className={style.description}>Auto Push</span>
              <Slider
                on={this.state.autoPush}
                name='AutoPush'
                trigger={this.handleTrigger}
                disable={!this.props.canMerge}
              />
            </div>
            <div className={style.one}>
              <DownloadCloud className={style.icon} />
              <span className={style.description}>Auto Merge</span>
              <Slider
                on={this.state.autoMerge}
                name='AutoMerge'
                trigger={this.handleTrigger}
                disable={!this.props.canMerge}
              />
            </div>
          </div>
          <div className={style.buttons}>
            <Button
              mode='fill'
              onClick={this.props.onPush}
              disable={this.props.isRunning}
            >
              Push
            </Button>
            <Button
              mode='outline'
              disable={!this.props.canMerge || this.props.isRunning}
              onClick={this.props.onMerge}
            >
              Merge
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className={style.wrapper}>
          <div className={style.placeholder}>Loading</div>
        </div>
      );
    }
  }
  public async componentWillReceiveProps(nextProps: Prop) {
    if (nextProps.domain !== this.props.domain) {
      this.setState({
        autoPush: await this.chromeLocal.get(generateKey(nextProps.domain, 'push')) === 'true',
        autoMerge: await this.chromeLocal.get(generateKey(nextProps.domain, 'merge')) === 'true',
      });
    }
  }
  private handleTrigger = async (name: string | undefined) => {
    let autoPush = this.state.autoPush;
    let autoMerge = this.state.autoMerge;
    switch (name) {
      case 'AutoPush':
        autoPush = !autoPush;
        break;
      case 'AutoMerge':
        autoMerge = !autoMerge;
        break;
      default:
        break;
    }
    await this.chromeLocal.bulkSet([
      {key: generateKey(this.props.domain, 'push'), value: autoPush.toString()},
      {key: generateKey(this.props.domain, 'merge'), value: autoMerge.toString()},
    ]);
    this.setState({
      autoPush,
      autoMerge,
    });
  }
}

export default Console;

import React, { Component } from 'react';

const style = require('./index.scss');

import Button from '../button';
import Slider from '../slider';

const UploadCloud = require('react-feather/dist/icons/upload-cloud').default;
const DownloadCloud = require('react-feather/dist/icons/download-cloud').default;
const Settings = require('react-feather/dist/icons/settings').default;
const { Textfit } = require('react-textfit');

interface Prop {
  domain: string;
  autoPush: boolean;
  autoMerge: boolean;
  canMerge: boolean;
  onMerge: () => void;
  onPush: () => void;
  isRunning: boolean;
}

class Console extends Component<Prop> {
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
              <Slider on={this.props.autoPush}/>
            </div>
            <div className={style.one}>
              <DownloadCloud className={style.icon} />
              <span className={style.description}>Auto Merge</span>
              <Slider on={this.props.autoMerge}/>
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
}

export default Console;

import React, { Component } from 'react';
const style = require('./index.scss');
import Button from '../button';
import Slider from '../slider';
const UploadCloud = require('react-feather/dist/icons/upload-cloud').default;
const DownloadCloud = require('react-feather/dist/icons/download-cloud').default;
const Settings = require('react-feather/dist/icons/settings').default;

interface Prop {
  domain?: string;
}

class Console extends Component<Prop> {
  public render() {
    if (this.props.domain) {
      return (
        <div className={style.wrapper}>
          <div className={style.domain}>{this.props.domain}</div>
          <div className={style.sliders}>
            <div className={style.one}>
              <div className={style.secret}>
                <UploadCloud className={[style.upload, style.icon].join(' ')} />
                <Settings className={[style.setting, style.icon].join(' ')} />
              </div>
              <span className={style.description}>Auto Push</span>
              <Slider on={true} />
            </div>
            <div className={style.one}>
              <DownloadCloud className={style.icon} />
              <span className={style.description}>Auto Merge</span>
              <Slider on={false} />
            </div>
          </div>
          <div className={style.buttons}>
            <Button mode='fill'>Merge</Button>
            <Button mode='outline'>Push</Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className={style.wrapper}>
          <div className={style.placeholder}>Please select a domain below.</div>
        </div>
      );
    }
  }
}

export default Console;

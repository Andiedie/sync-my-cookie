import React, { Component } from 'react';
const style = require('./index.scss');
import Button from '../button';
import Slider from '../slider';
const UploadCloud = require('react-feather/dist/icons/upload-cloud').default;
const DownloadCloud = require('react-feather/dist/icons/download-cloud').default;
const Settings = require('react-feather/dist/icons/settings').default;
import { getCurrentTabUrl } from '../../utils/chrome';
import { getDomain } from '../../utils/util';

interface State {
  domain: string;
}

class Console extends Component<{}, State> {
  public constructor(props: {}) {
    super(props);
    this.state = {
      domain: '',
    };
  }
  public render() {
    if (this.state.domain) {
      return (
        <div className={style.wrapper}>
          <div className={style.domain}>{this.state.domain}</div>
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
          <div className={style.placeholder}>Loading</div>
        </div>
      );
    }
  }
  public async componentDidMount() {
    const url = await getCurrentTabUrl();
    this.setState({
      domain: getDomain(url),
    });
  }
}

export default Console;

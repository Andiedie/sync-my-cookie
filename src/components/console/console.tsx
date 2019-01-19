import React, { Component } from 'react';
const style = require('./console.module.scss');

import { Button, Icon, Spin, Switch, Tooltip } from 'antd';
const { Textfit } = require('react-textfit');

interface Prop {
  domain: string;
  canMerge: boolean;
  autoPush: boolean;
  autoMerge: boolean;
  onMerge: () => void;
  onPush: () => void;
  onAutoConfigChange: (config: {autoPush: boolean, autoMerge: boolean}) => void;
}

interface State {
  pushLoading: boolean;
  mergeLoading: boolean;
}

class Console extends Component<Prop, State> {
  public constructor(props: Prop) {
    super(props);
    this.state = {
      pushLoading: false,
      mergeLoading: false,
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
                <Icon type='cloud-upload' className={[style.upload, style.icon].join(' ')} />
                <Tooltip placement='topLeft' title='Configure Auto Push'>
                  <Icon type='setting' className={[style.setting, style.icon].join(' ')} />
                </Tooltip>
              </div>
              <span className={style.description}>Auto Push</span>
              <Switch
                checked={this.props.autoPush}
                onChange={this.handleAutoPushChange}
                disabled={!this.props.canMerge}
              />
            </div>
            <div className={style.one}>
              <Icon type='cloud-download' className={style.icon} />
              <span className={style.description}>Auto Merge</span>
              <Switch
                checked={this.props.autoMerge}
                onChange={this.handleAutoMergeChange}
                disabled={!this.props.canMerge}
              />
            </div>
          </div>
          <div className={style.buttons}>
            <Button
              type='primary'
              onClick={this.props.onPush}
              loading={this.state.pushLoading}
              size='large'
            >
              Push
            </Button>
            <Button
              type='default'
              onClick={this.props.onPush}
              disabled={!this.props.canMerge}
              loading={this.state.mergeLoading}
              size='large'
            >
              Merge
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className={style.empty}>
          <Spin size='large' />
        </div>
      );
    }
  }
  private handleAutoPushChange = async (checked: boolean) => {
    this.setState({pushLoading: true});
    const config = {
      autoPush: checked,
      autoMerge: this.props.autoMerge,
    };
    await this.props.onAutoConfigChange(config);
    this.setState({pushLoading: false});
  }
  private handleAutoMergeChange = async (checked: boolean) => {
    this.setState({mergeLoading: true});
    const config = {
      autoPush: this.props.autoPush,
      autoMerge: checked,
    };
    this.props.onAutoConfigChange(config);
    this.setState({mergeLoading: false});
  }
}

export default Console;

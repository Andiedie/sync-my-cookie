import React, { Component } from 'react';
const style = require('./console.module.scss');

import { Button, Icon, Modal, Select, Spin, Switch, Tooltip } from 'antd';
import { auto, AutoConfiguration, gist } from '../../utils/store';
const { Textfit } = require('react-textfit');

import _ from 'lodash';

interface Prop {
  domain: string;
  canMerge: boolean;
  onMerge: () => void;
  onPush: () => void;
}

interface State {
  autoMerge: boolean;
  autoPush: boolean;
  autoPushName: string[];
  pushLoading: boolean;
  configuring: boolean;
  options: JSX.Element[];
}

class Console extends Component<Prop, State> {
  public constructor(props: Prop) {
    super(props);
    this.state = {
      autoMerge: false,
      autoPush: false,
      autoPushName: [],
      pushLoading: false,
      configuring: false,
      options: [],
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
                  <Button
                    shape='circle'
                    icon='setting'
                    className={style.setting}
                    onClick={this.handleAutoPushConfigClick}
                    disabled={!this.props.canMerge}
                  />
                </Tooltip>
                <Modal
                  title='Configure Auto Push Rules'
                  visible={this.state.configuring}
                  onOk={this.handleAutoPushConfigDone}
                  onCancel={this.handleAutoPushConfigClose}
                >
                  <div>Only push when these cookies are changed:</div>
                  <Select<string[]>
                    mode='tags'
                    className={style.select}
                    placeholder='Name of cookie, empty for all'
                    onChange={this.handleAutoPushConfigChange}
                    value={this.state.autoPushName}
                    style={{ width: '100%' }}
                  >
                    {this.state.options}
                  </Select>
                </Modal>
              </div>
              <span className={style.description}>Auto Push</span>
              <Switch
                checked={this.state.autoPush}
                onChange={this.handleAutoPushChange}
                disabled={!this.props.canMerge}
              />
            </div>
            <div className={style.one}>
              <Icon type='cloud-download' className={style.icon} />
              <span className={style.description}>Auto Merge</span>
              <Switch
                checked={this.state.autoMerge}
                onChange={this.handleAutoMergeChange}
                disabled={!this.props.canMerge}
              />
            </div>
          </div>
          <div className={style.buttons}>
            <Button
              type='primary'
              onClick={this.handlePush}
              loading={this.state.pushLoading}
              size='large'
            >
              Push
            </Button>
            <Button
              type='default'
              onClick={this.props.onMerge}
              disabled={!this.props.canMerge}
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

  public async componentWillReceiveProps(nextProps: Prop) {
    const config = await auto.get(nextProps.domain);
    this.setState({...config});
  }

  private handleAutoPushConfigClick = async () => {
    const cookies = await gist.getCookies(this.props.domain);
    const options = _.uniq(cookies.map((cookie) => cookie.name as string)).map((name) => {
      return <Select.Option key={name}>{name}</Select.Option>;
    });
    this.setState({
      configuring: true,
      options,
    });
  }
  private handleAutoPushConfigDone = async () => {
    const config: AutoConfiguration = {
      autoPush: this.state.autoPush,
      autoMerge: this.state.autoMerge,
      autoPushName: this.state.autoPushName,
    };
    await auto.set(this.props.domain, config);
    this.handleAutoPushConfigClose();
  }
  private handleAutoPushConfigClose = () => {
    this.setState({configuring: false});
  }
  private handleAutoPushConfigChange =
    async (value: string[], options: React.ReactElement<any> | Array<React.ReactElement<any>>) => {
    if (options instanceof Array) {
      const autoPushName = options
        .filter((option) => typeof option.key === 'string')
        .map((option) => option.key) as string[];
      this.setState({autoPushName});
    }
  }
  private handlePush = async () => {
    this.setState({pushLoading: true});
    await this.props.onPush();
    this.setState({pushLoading: false});
  }
  private handleAutoPushChange = async (checked: boolean) => {
    this.setState({
      autoPush: checked,
    });
    const config: AutoConfiguration = {
      autoPush: checked,
      autoMerge: this.state.autoMerge,
      autoPushName: this.state.autoPushName,
    };
    await auto.set(this.props.domain, config);
  }
  private handleAutoMergeChange = async (checked: boolean) => {
    this.setState({
      autoMerge: checked,
    });
    const config: AutoConfiguration = {
      autoPush: this.state.autoPush,
      autoMerge: checked,
      autoPushName: this.state.autoPushName,
    };
    await auto.set(this.props.domain, config);
  }
}

export default Console;

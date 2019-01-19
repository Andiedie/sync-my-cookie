import React, { Component } from 'react';
import './setting.scss';
const style = require('./setting.module.scss');

import { Modal } from 'antd';
import { Button, Collapse, Icon, Input, Tooltip } from 'antd';

import { KevastGist } from 'kevast-gist';
import { setting } from '../../utils/store';

interface Prop {
  onSet: () => void;
}

export interface State {
  token: string;
  password: string;
  gistId?: string;
  filename?: string;
  loading: boolean;
}

class Setting extends Component<Prop, State> {
  public constructor(props: Prop) {
    super(props);
    this.state = {
      token: '',
      password: '',
      loading: false,
    };
  }
  public render() {
    return (
      <div className={style.wrapper}>
        <img src='/icon/icon128.png'/>
        <Input
          name='token'
          placeholder='GitHub Access Token'
          prefix={<Icon type='github' style={{ color: 'rgba(0,0,0,.25)' }} />}
          allowClear={true}
          onChange={this.handleChange}
          value={this.state.token}
          className={style.input}
        />
        <Tooltip title='NOT your GitHub password, but a key to encrypt your cookies.' placement='topLeft'>
          <Input
            name='password'
            placeholder='Password'
            prefix={<Icon type='key' style={{ color: 'rgba(0,0,0,.25)' }} />}
            allowClear={true}
            onChange={this.handleChange}
            value={this.state.password}
            className={style.input}
          />
        </Tooltip>
        <Collapse bordered={false} className={style.collapse}>
          <Collapse.Panel header='Optional' key='2' className={style.panel}>
            <Input
              name='gistId'
              placeholder='Gist ID'
              prefix={<Icon type='fork' style={{ color: 'rgba(0,0,0,.25)' }} />}
              allowClear={true}
              onChange={this.handleChange}
              value={this.state.gistId}
              className={style.input}
            />
            <Input
              name='filename'
              placeholder='File Name'
              prefix={<Icon type='file' style={{ color: 'rgba(0,0,0,.25)' }} />}
              allowClear={true}
              onChange={this.handleChange}
              value={this.state.filename}
              className={[style.input, style.filename].join(' ')}
            />
          </Collapse.Panel>
        </Collapse>
        <Button
          type='primary'
          disabled={!this.state.token || !this.state.password}
          onClick={this.handleClick}
          block={true}
          icon='setting'
          loading={this.state.loading}
        >
          Set
        </Button>
      </div>
    );
  }
  public async componentDidMount() {
    this.setState({
      token: await setting.get('token') || '',
      password: await setting.get('password') || '',
      gistId: await setting.get('gistId') || '',
      filename: await setting.get('filename') || '',
    });
  }
  private handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.currentTarget;
    const value = target.value as any;
    const name = target.name;
    this.setState({
      [name]: value,
    } as Pick<State, keyof State>);
  }
  private handleClick = async () => {
    this.setState({
      loading: true,
    });
    const kevastGist = new KevastGist(this.state.token, this.state.gistId, this.state.filename);
    try {
      await kevastGist.init();
    } catch (err) {
      Modal.error({
        title: 'Fail',
        content: err.message,
      });
      return;
    }
    await setting.set({
      token: this.state.token,
      password: this.state.password,
      gistId: await kevastGist.getGistId(),
      filename: await kevastGist.getFilename(),
    });
    this.props.onSet();
  }
}

export default Setting;

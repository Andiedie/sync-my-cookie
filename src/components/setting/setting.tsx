import React, { Component } from 'react';
const style = require('./setting.scss');

import Button from '../button/button';

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
  isRunning: boolean;
}

class Setting extends Component<Prop, State> {
  public constructor(props: Prop) {
    super(props);
    this.state = {
      token: '',
      password: '',
      isRunning: false,
    };
  }
  public render() {
    return (
      <div className={style.wrapper}>
        <img src='/icon/icon128.png'/>
        <div>
          <input
            type='text'
            name='token'
            placeholder='GitHub Access Token'
            value={this.state.token}
            onChange={this.handleChange}
            className={style.token}
          />
        </div>
        <div>
          <input
            type='text'
            name='password'
            placeholder='Password'
            value={this.state.password}
            onChange={this.handleChange}
            className={style.password}
          />
        </div>
        <details>
          <summary>Optional</summary>
          <div>
            <input
              type='text'
              name='gistId'
              placeholder='Gist ID'
              value={this.state.gistId}
              onChange={this.handleChange}
              className={style.gistId}
            />
          </div>
          <div>
            <input
              type='text'
              name='filename'
              placeholder='File Name'
              value={this.state.filename}
              onChange={this.handleChange}
              className={style.filename}
            />
          </div>
        </details>
        <Button
          mode='fill'
          disable={!this.state.token || !this.state.password || this.state.isRunning}
          onClick={this.handleClick}
        >
          Settings
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
    const target = event.target;
    const value = target.value as any;
    const name = target.name;
    this.setState({
      [name]: value,
    } as Pick<State, keyof State>);
  }
  private handleClick = async () => {
    this.setState({
      isRunning: true,
    });
    const kevastGist = new KevastGist(this.state.token, this.state.gistId, this.state.filename);
    try {
      await kevastGist.init();
    } catch (err) {
      alert(err.message);
      return;
    }
    await setting.set({
      token: this.state.token,
      password: this.state.password,
      gistId: this.state.gistId,
      filename: this.state.filename,
    });
    this.props.onSet();
  }
}

export default Setting;

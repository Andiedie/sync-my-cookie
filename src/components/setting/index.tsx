import React, { Component } from 'react';
const style = require('./index.scss');

import Button from '../button';

import { Kevast } from 'kevast';
import { KevastChromeSync } from 'kevast-chrome';
import { KevastGist } from 'kevast-gist';

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
  private chromeSync: Kevast;
  public constructor(props: Prop) {
    super(props);
    this.chromeSync = new Kevast(new KevastChromeSync());
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
      token: await this.chromeSync.get('token') || '',
      password: await this.chromeSync.get('password') || '',
      gistId: await this.chromeSync.get('gistId') || '',
      filename: await this.chromeSync.get('filename') || '',
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
    const bulk = [
      {key: 'token', value: this.state.token},
      {key: 'password', value: this.state.password},
      {key: 'gistId', value: await kevastGist.getGistId()},
      {key: 'filename', value: await kevastGist.getFilename()},
    ];
    await this.chromeSync.bulkSet(bulk);
    this.props.onSet();
  }
}

export default Setting;

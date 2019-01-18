import React, { Component } from 'react';
const style = require('./setting.scss');

import Button from '../button/button';

import { Kevast } from 'kevast';
import { KevastChromeSync } from 'kevast-chrome';
import { KevastGist } from 'kevast-gist';
import * as keys from '../../utils/keys';

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
            name={keys.TOKEN_KEY}
            placeholder='GitHub Access Token'
            value={this.state.token}
            onChange={this.handleChange}
            className={style.token}
          />
        </div>
        <div>
          <input
            type='text'
            name={keys.PASSWORD_KEY}
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
              name={keys.GIST_ID_KEY}
              placeholder='Gist ID'
              value={this.state.gistId}
              onChange={this.handleChange}
              className={style.gistId}
            />
          </div>
          <div>
            <input
              type='text'
              name={keys.FILE_NAME_KEY}
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
      token: await this.chromeSync.get(keys.TOKEN_KEY) || '',
      password: await this.chromeSync.get(keys.PASSWORD_KEY) || '',
      gistId: await this.chromeSync.get(keys.GIST_ID_KEY) || '',
      filename: await this.chromeSync.get(keys.FILE_NAME_KEY) || '',
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
      {key: keys.TOKEN_KEY, value: this.state.token},
      {key: keys.PASSWORD_KEY, value: this.state.password},
      {key: keys.GIST_ID_KEY, value: await kevastGist.getGistId()},
      {key: keys.FILE_NAME_KEY, value: await kevastGist.getFilename()},
    ];
    await this.chromeSync.bulkSet(bulk);
    this.props.onSet();
  }
}

export default Setting;

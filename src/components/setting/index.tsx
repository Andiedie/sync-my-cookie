import React, { Component } from 'react';
const style = require('./index.scss');

import Button from '../button';

import { Kevast } from 'kevast';
import { KevastChromeLocal } from 'kevast-chrome';
import { KevastGist } from 'kevast-gist';

interface Prop {
  onSet: (options: Options) => void;
}

export interface Options {
  token: string;
  password: string;
  gistId?: string;
  filename?: string;
}

class Setting extends Component<Prop, Options> {
  public constructor(props: Prop) {
    super(props);
    this.state = {
      token: '',
      password: '',
    };
  }
  public render() {
    return (
      <div className={style.wrapper}>
        <div>
          <input
            type='text'
            name='token'
            placeholder='token'
            value={this.state.token}
            onChange={this.handleChange}
            className={style.token}
          />
        </div>
        <div>
          <input
            type='text'
            name='password'
            placeholder='password'
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
              placeholder='gistId'
              value={this.state.gistId}
              onChange={this.handleChange}
              className={style.gistId}
            />
          </div>
          <div>
            <input
              type='text'
              name='filename'
              placeholder='filename'
              value={this.state.filename}
              onChange={this.handleChange}
              className={style.filename}
            />
          </div>
        </details>
        <Button
          mode='fill'
          disable={!this.state.token || !this.state.password}
          onClick={this.handleClick}
        >
          Settings
        </Button>
      </div>
    );
  }
  private handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    } as Pick<Options, keyof Options>);
  }
  private handleClick = async () => {
    const kevastGist = new KevastGist(this.state.token, this.state.gistId, this.state.filename);
    try {
      await kevastGist.init();
    } catch (err) {
      alert(err.message);
      return;
    }
    const kevast = new Kevast(new KevastChromeLocal());
    await kevast.bulkSet([
      {key: 'token', value: this.state.token},
      {key: 'password', value: this.state.password},
      {key: 'gistId', value: await kevastGist.getGistId()},
      {key: 'filename', value: await kevastGist.getFilename()},
    ]);
    this.props.onSet(this.state);
  }
}

export default Setting;

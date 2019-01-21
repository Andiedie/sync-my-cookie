import React, {Component} from 'react';
import ReactDom from 'react-dom';
const style = require('./options.module.scss');
import './global.scss';

import { Modal } from 'antd';
import Settings from './components/setting/setting';

class Options extends Component {
  public render() {
    return (
      <div className={style.wrapper}>
        <div className={style.setting}>
          <Settings onSet={this.handleSet} />
        </div>
      </div>
    );
  }
  private handleSet = () => {
    Modal.success({
      title: 'Saved',
      onOk() {
        window.close();
      },
    });
  }
}

ReactDom.render(
  <Options />,
  document.getElementById('root'),
);

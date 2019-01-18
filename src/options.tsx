import React, {Component} from 'react';
import ReactDom from 'react-dom';
const style = require('./options.scss');
import './global.scss';

import Settings from './components/setting';

class Options extends Component {
  public render() {
    return (
      <div className={style.flex}>
        <div className={style.wrapper}>
          <Settings onSet={this.handleSet} />
        </div>
      </div>
    );
  }
  private handleSet = () => {
    alert('Saved');
    window.close();
  }
}

ReactDom.render(
  <Options />,
  document.getElementById('root'),
);

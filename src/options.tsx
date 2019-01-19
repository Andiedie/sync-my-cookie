import React, {Component} from 'react';
import ReactDom from 'react-dom';
const style = require('./options.module.scss');
import './global.scss';

import Settings from './components/setting/setting';

import swal from 'sweetalert';

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
  private handleSet = async () => {
    await swal({
      title: 'Saved',
      icon: 'success',
    });
    window.close();
  }
}

ReactDom.render(
  <Options />,
  document.getElementById('root'),
);

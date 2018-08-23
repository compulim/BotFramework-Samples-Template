import { css } from 'glamor';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

css.global('body', { margin: 0 });
css.global('html, body', { height: '100%' });

ReactDOM.render(<App />, document.getElementById('root'));

registerServiceWorker();

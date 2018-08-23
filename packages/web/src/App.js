import { css } from 'glamor';
import React from 'react';

const ROOT_CSS = css({
  display: 'flex',
  flex: 1,

  '.web-chat': {
    flex: 1
  }
});

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.webChatRef = React.createRef();

    this.state = {
      token: null
    };
  }

  componentDidMount() {
    this.generateToken().then(() => 0);
  }

  async generateToken() {
    const res = await fetch('/token-generate', { method: 'POST' });
    const { token } = await res.json();

    this.setState(() => ({ token }));
  }

  componentDidUpdate(_, prevState) {
    if (!prevState.token && this.state.token) {
      console.log('creating Web Chat');
      console.log(this.state);

      const { current } = this.webChatRef;

      if (current) {
        window.BotChat.App({
          directLine: {
            ...this.state
          },
          user: {
            id: 'default-user',
            name: 'User'
          }
        }, current);
      }
    }
  }

  render() {
    return (
      <div className={ ROOT_CSS }>
        <div ref={ this.webChatRef } />
      </div>
    );
  }
}

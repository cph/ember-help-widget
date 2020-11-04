'use strict';

module.exports = {
  name: require('./package').name,

  included() {
    this._super.included.apply(this, arguments);
    this.import('vendor/zendesk-chat/web-sdk.js', { using: [{ transformation: 'amd', as: 'zendesk-chat-sdk' }] });
  }
};

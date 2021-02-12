'use strict';

module.exports = {
  name: require('./package').name,

  included() {
    // This initialization is done by ember-cli-mirage before running _super.included.
    // Without it, the addon seems to be elevated in an unhelpful way that causes
    // ember-auto-import to import the webpacker settings of the root project twice.
    const app = this._findHost();
    this.app = app;

    this._super.included.apply(this, arguments);
    this.import('vendor/zendesk-chat/web-sdk.js', { using: [{ transformation: 'amd', as: 'zendesk-chat-sdk' }] });
  }
};

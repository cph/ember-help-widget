import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { Views } from '../models/constants';
import { parallel } from 'ember-animated';
import move from 'ember-animated/motions/move';
import { fadeIn, fadeOut } from 'ember-animated/motions/opacity';
import { easeOut } from 'ember-animated/easings/cosine';

export default class HelpWidgetComponent extends Component {
  @service zendeskChat;
  @service intl;

  @tracked isOpen = false;
  @tracked currentView = Views.HELP;

  get widgetHeader() { return this.args.viewName || this.intl.t('ember-help-widget.default-header'); }

  get altContactMethods() {
    const url = this.intl.t('ember-help-widget.help-center-url'),
          phone = this.intl.t('ember-help-widget.contact-phone-number');
    return this.intl.t('ember-help-widget.feedback.alt-contact', { url, phone, htmlSafe: true });
  }

  get showingHelp() { return this.currentView === Views.HELP; }
  get showingFeedback() { return this.currentView === Views.FEEDBACK; }
  get showingChat() { return this.currentView === Views.CHAT; }

  get isChatAvailable() { return this.zendeskChat.isOnline; }
  get inChat() { return this.zendeskChat.joinedChat; }
  get hasUnreadMessages() { return this.zendeskChat.unreadMessagesCount > 0; }
  get showUnreadBadge() { return this.hasUnreadMessages && !this.isOpen; }

  /* eslint-disable require-yield */
  *transition({ insertedSprites, keptSprites, removedSprites }) {
    for (const sprite of insertedSprites) {
      const { y } = sprite.absoluteFinalBounds;
      sprite.startAtPixel({ y: y + 16 });
      parallel(move(sprite, { easing: easeOut }), fadeIn(sprite, { easing: easeOut }));
    }

    for (const sprite of keptSprites) {
      move(sprite);
    }

    for (const sprite of removedSprites) {
      const { y } = sprite.absoluteInitialBounds;
      sprite.endAtPixel({ y: y + 16 });
      parallel(move(sprite, { easing: easeOut }), fadeOut(sprite, { easing: easeOut }));
    }
  }
  /* eslint-enable require-yield */

  @action toggleOpen() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) { this.resetView(); }
  }

  @action showHelp() { this.currentView = Views.HELP; }
  @action showFeedback() { this.currentView = Views.FEEDBACK; }
  @action showChat() { this.currentView = Views.CHAT; }

  @action connectChat() {
    // Have to go ahead and connect the chat in order to get
    // current status, unread messages, etc.
    this.zendeskChat.chatTags = this.args.chatTags || [];
    this.updateChatInfo();
    this.zendeskChat.connect({ zendeskChatKey: this.args.zendeskChatKey });
  }

  @action
  updateChatInfo() {
    this.zendeskChat.currentUserName = this.args.currentUserName;
    this.zendeskChat.currentUserEmail = this.args.currentUserEmail;
    this.zendeskChat.sendUserInfo();
  }

  resetView() {
    this.currentView = this.zendeskChat.isChatting ? Views.CHAT : Views.HELP;
  }
}

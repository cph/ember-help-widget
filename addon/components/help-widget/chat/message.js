import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';

export default class HelpWidgetChatMessageComponent extends Component {
  @service zendeskChat;

  @tracked tentativeFeedback = '';

  get isVisitor() { return this.args.message?.isVisitor; }
  get isAgent() { return this.args.message?.isAgent; }
  get isStatus() { return this.args.message?.isStatus; }

  get messageClass() {
    if (this.isVisitor) { return htmlSafe('ember-help-widget-chat-visitor'); }
    if (this.isAgent) { return htmlSafe('ember-help-widget-chat-agent'); }
    if (this.isStatus) { return htmlSafe('ember-help-widget-chat-status'); }

    return htmlSafe('');
  }

  get messages() { return this.zendeskChat.messages; }

  get showDisplayName() {
    const index = this.messages.indexOf(this.args.message);
    if (index < 1) { return true; }
    return this.messages[index - 1].nickname !== this.args.message.nickname;
  }

  get speaker() {
    return this.zendeskChat.participants.find(participant => participant.nickname === this.args.message.nickname);
  }

  get formattedTimestamp() {
    return this.args.message.timestamp.format('MMMM D, YYYY h:mma');
  }

  @action
  submitFeedback() {
    this.args.onFeedback?.(this.tentativeFeedback);
  }
}

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { schedule } from '@ember/runloop';
import { isBlank } from '@ember/utils';
import { timeout } from 'ember-concurrency';
import { restartableTask } from 'ember-concurrency-decorators';
import autosize from 'autosize';

const TYPING_TIMEOUT = 1000; // in ms
const DEFAULT_FILE_TYPES = [
  '.jpg', 'image/jpeg',
  '.png', 'image/png',
  '.gif', 'image/gif',
  '.pdf', 'application/pdf',
  '.doc', '.docx', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export default class HelpWidgetChatComponent extends Component {
  @service zendeskChat;

  @tracked tentativeMessage = '';
  @tracked sendingMessage = false;
  @tracked tentativeFeedback = '';
  @tracked isTyping;

  supportedFileTypes = this.args.supportedFileTypes || DEFAULT_FILE_TYPES;

  #chatEl = null;
  #feedbackDropdownApi = null;

  get chatOffline() { return !this.zendeskChat.isOnline; }
  get messageEditingDisabled() { return this.sendingMessage || this.chatOffline; }

  @action
  connect(el) {
    this.#chatEl = el;
    this.scrollToBottom();
  }

  @action
  scrollToBottom() {
    if (!this.#chatEl) { return; }
    schedule('afterRender', () => {
      const messageHistory = this.#chatEl.querySelector('.ember-help-widget-chat-history');
      if (messageHistory.scrollHeight === messageHistory.clientHeight) {
        this.onScroll({ target: messageHistory });
      } else {
        messageHistory.scrollTop = messageHistory.scrollHeight;
      }
    });
  }

  @action
  startAutosize(el) {
    autosize(el.querySelectorAll('textarea'));
  }

  @action
  syncComments() {
    if (this.zendeskChat.comments !== this.tentativeFeedback) {
      this.tentativeFeedback = this.zendeskChat.comments;
    }
  }

  @action
  updateTentativeMessage({ target }) {
    this.tentativeMessage = target.value;
  }

  @action
  onKeydown(e) {
    // Filter <Enter>s so we don't create superfluous line breaks
    if (e.key === 'Enter') {
      e.preventDefault();
      this.sendMessage();
      return false;
    }
    this.notifyOfTypingTask.perform();
    return true;
  }

  @action
  onScroll({ target }) {
    if (target.scrollTop === target.scrollHeight - target.clientHeight) {
      this.zendeskChat.markAllRead();
    }
  }

  @action
  sendMessage() {
    if (this.messageEditingDisabled) { return; }
    if (isBlank(this.tentativeMessage)) { return; }
    if (!this.zendeskChat.joinedChat) { this.zendeskChat.sendUserInfo(); }
    this.sendingMessage = true;
    this._setTyping(false);
    this.zendeskChat.send(this.tentativeMessage).then(() => {
      this.tentativeMessage = '';
    }).finally(() => {
      this.sendingMessage = false;
      schedule('afterRender', () => {
        this.#chatEl.querySelector('textarea').focus();
      });
    });
  }

  @action
  endChat() {
    this.zendeskChat.endChat();
    this.args.back?.();
  }

  @action
  uploadFile(file) {
    return this.zendeskChat.sendFile(file);
  }

  @action
  toggleRating(rating) {
    if (this.zendeskChat.rating === rating) { rating = null; }
    this.zendeskChat.rate(rating);
  }

  @action
  setFeedbackDropdownApi(api) {
    this.#feedbackDropdownApi = api;
  }

  @action
  updateFeedback(feedback) {
    feedback = feedback.trim();
    if (feedback !== this.zendeskChat.comments) {
      this.zendeskChat.comment(feedback);
    }
  }

  @action
  updateFeedbackFromTentative() {
    this.updateFeedback(this.tentativeFeedback);
  }

  @action
  onFeedbackInput({ target }) {
    this.tentativeFeedback = target.value;
  }

  @action
  closeFeedbackOnEnter({ key }) {
    if (key === 'Enter') { this.#feedbackDropdownApi?.actions?.close(); }
  }

  @restartableTask
  *notifyOfTypingTask() {
    if (!this.isTyping) { this._setTyping(true); }
    yield timeout(TYPING_TIMEOUT);
    this._setTyping(false);
  }

  _setTyping(typing) {
    this.isTyping = typing;
    this.zendeskChat.setTyping(typing);
  }
}

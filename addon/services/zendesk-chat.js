import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import ChatMessage from '../models/chat-message';
import ChatParticipant from '../models/chat-participant';
import { Promise as EmberPromise } from 'rsvp';
import moment from 'moment';
import zChat from 'zendesk-chat-sdk';

export default class ZendeskChatService extends Service {
  @service router;
  @service intl;

  @tracked currentUserName = null;
  @tracked currentUserEmail = null;
  @tracked chatTags = [];

  @tracked _connectionStatus = 'closed';
  get connectionStatus() { return this._connectionStatus; }
  set connectionStatus(value) {
    if (this._connectionStatus !== value && value === 'connected') {
      // We've just connected!
      this.sendUserInfo();
      this._sendPathInfo();
      this._addTags();
    }
    this._connectionStatus = value;
  }

  @tracked accountStatus = 'offline';

  @tracked participants = [];
  @tracked agentTyping = null;
  @tracked queuePosition = 0;
  @tracked transcriptRequested = false;

  @tracked messages = [];
  @tracked lastReadTimestamp = 0;
  @tracked joinedChat = false;
  @tracked rating = '';
  @tracked comments = '';

  #initialized = false;
  #observingConnection = false;
  #observingAccount = false;
  #observingRoute = false;
  #observingAgents = false;
  #observingChat = false;

  get isConnected() { return this.connectionStatus === 'connected'; }
  get isOnline() { return this.accountStatus === 'online'; }
  get isChatting() { return this.isConnected && zChat.isChatting(); }

  get unreadMessagesCount() {
    return this.messages
      .filter(message => message.isAgent && message.timestamp.isAfter(this.lastReadTimestamp))
      .length;
  }

  connect({ zendeskChatKey }) {
    this._observeConnection();
    this._observeAccount();
    this._observeRoute();
    this._observeChat();

    if (!this.#initialized) {
      this.#initialized = true;
      zChat.init({
        account_key: zendeskChatKey,
        suppress_console_error: true
      });
    } else if (this.connectionStatus === 'closed') {
      zChat.reconnect();
    }

    if (this.isConnected) { this.sendUserInfo(); }
  }


  send(message) {
    return new EmberPromise((resolve, reject) => {
      if (this.isOnline) {
        zChat.sendChatMsg(message, err => {
          if (err) {
            reject(err);
          } else {
            // Have to assign or else @tracked won't pick up the change
            this._appendMessage(new ChatMessage({
              nick: 'visitor',
              display_name: this.currentUserName || this.currentUserEmail,
              timestamp: Date.now(),
              msg: message
            }));
            resolve();
          }
        });
      } else {
        const { currentUserName: name, currentUserEmail: email } = this;
        zChat.sendOfflineMsg({ name, email, message }, err => {
          if(err) { reject(err); } else { resolve(); }
        });
      }
    });
  }

  sendFile(file) {
    return new EmberPromise((resolve, reject) => {
      zChat.sendFile(file, (err, attachment) => {
        if (err) {
          reject(err);
        } else {
          this._appendMessage(new ChatMessage({
            nick: 'visitor',
            display_name: this.currentUserName || this.currentUserEmail,
            timestamp: Date.now(),
            attachment
          }));
          resolve();
        }
      });
    });
  }

  setTyping(isTyping) {
    zChat.sendTyping(isTyping);
  }

  markAllRead() {
    zChat.markAsRead();
  }

  endChat() {
    return new EmberPromise((resolve, reject) => {
      zChat.endChat(err => {
        if (err) {
          reject(err);
        } else {
          this.joinedChat = false;
          this.messages = [];
          this.participants = [];
          this.rating = '';
          this.comments = '';
          resolve();
        }
      });
    });
  }

  requestTranscript() {
    return new EmberPromise((resolve, reject) => {
      if (this.transcriptRequested) { resolve(); }
      if (!this.isChatting) { reject('Not currently in a chat'); }
      zChat.sendEmailTranscript(this.currentUserEmail, err => {
        if (err) {
          reject(err);
        } else {
          this.transcriptRequested = true;
          resolve();
        }
      });
    });
  }

  getHours() {
    return new EmberPromise((resolve, reject) => {
      const hours = zChat.getOperatingHours();
      if (hours === undefined) {
        reject();
      } else {
        // TODO: Process hours into a more readable format
        // cf. https://api.zopim.com/web-sdk/#zchat-getoperatinghours
        resolve(hours);
      }
    });
  }

  rate(rating) {
    return new EmberPromise((resolve, reject) => {
      rating = [ 'good', 'bad' ].includes(rating) ? rating : null;
      zChat.sendChatRating(rating, err => {
        if (err) { reject(err); } else { resolve(); }
      });
    });
  }

  comment(comment) {
    return new EmberPromise((resolve, reject) => {
      zChat.sendChatComment(comment, err => {
        if (err) { reject(err); } else { resolve(); }
      });
    });
  }

  avatarUrlFor(nickname) {
    const participant = this.participants.find(p => p.nickname === nickname);
    if (participant && participant.avatar_path) { return participant.avatar_path; }
    return null;
  }



  sendUserInfo() {
    return new EmberPromise((resolve, reject) => {
      if (!this.isConnected) { return reject(); }
      zChat.setVisitorInfo({
        display_name: this.currentUserName,
        email: this.currentUserEmail
      }, err => { if (err) { reject(err); } else { resolve(); } });
    });
  }

  _sendPathInfo() {
    const url = window.location.href,
          title = window.document.title;
    zChat.sendVisitorPath({ title, url });
  }

  _addTags() {
    return new EmberPromise((resolve, reject) => {
      zChat.addTags(this.chatTags, err => {
        if (err) { reject(err); } else { resolve(); }
      });
    });
  }

  _appendMessage(message) {
    this.messages = this.messages.concat([ message ]);
  }

  _appendParticipant(participant) {
    this.participants = this.participants.concat([ participant ]);
  }

  _removeParticipant(participant) {
    this.participants = this.participants.reject(p => p === participant);
  }

  _observeConnection() {
    if (this.#observingConnection) { return; }
    this.#observingConnection = true;
    zChat.on('connection_update', status => this.connectionStatus = status);
  }

  _observeAccount() {
    if (this.#observingAccount) { return; }
    this.#observingAccount = true;
    zChat.on('account_status', status => this.accountStatus = status);
  }

  _observeRoute() {
    if (this.#observingRoute) { return; }
    this.#observingRoute = true;
    this.router.on('routeDidChange', () => this._sendPathInfo());
  }

  _observeAgents() {
    if (this.#observingAgents) { return; }
    this.#observingAgents = true;
    zChat.on('agent_update', agent => {
      const participant = this.participants.find(p => p.nickname === agent.nick);
      if (participant) {
        participant.displayName = agent.display_name;
        participant.avatarUrl = agent.avatar_path;
        participant.title = agent.title;
      }
    });
  }

  _observeChat() {
    if (this.#observingChat) { return; }
    this.#observingChat = true;
    zChat.on('chat', update => {
      let msg, name, rating;
      switch (update.type) {
        case 'typing':
          this.agentTyping = update.typing ? this.participants.find(p => p.nickname === update.nick) : null;
          break;
        case 'chat.msg':
        case 'chat.file':
          this._appendMessage(new ChatMessage(update));
          break;
        case 'chat.queue_position':
          this.queuePosition = update.queue_position;
          break;
        case 'chat.memberjoin':
          this._appendParticipant(new ChatParticipant(update));
          if (update.nick !== 'visitor') {
            const msg = this.intl.t('ember-help-widget.chat.joined', { name: update.display_name });
            this._appendMessage(new ChatMessage({ msg }));
          } else {
            this.joinedChat = true;
          }
          break;
        case 'chat.memberleave':
          this.removeParticipant(this.participants.find(p => p.nickname === update.nick));
          msg = this.intl.t('ember-help-widget.chat.left', { name: update.display_name });
          this._appendMessage(new ChatMessage({ msg }));
          break;
        case 'chat.request.rating':
          msg = this.intl.t('ember-help-widget.chat.rating-request', { name: update.display_name });
          this._appendMessage(new ChatMessage({ msg, isRatingRequest: true }));
          break;
        case 'chat.rating':
          this.rating = update.new_rating || '';
          name = update.display_name;
          rating = update.new_rating;
          msg = rating ?
            this.intl.t('ember-help-widget.chat.added-rating', { name, rating }) :
            this.intl.t('ember-help-widget.chat.removed-rating', { name });
          this._appendMessage(new ChatMessage({ msg }));
          break;
        case 'chat.comment':
          this.comments = update.new_comment || '';
          msg = this.intl.t('ember-help-widget.chat.commented', { name: update.display_name });
          this._appendMessage(new ChatMessage({ msg }));
          break;
        case 'last_read':
          this.lastReadTimestamp = moment(update.timestamp);
          break;
        default:
          // console.log('[service:zendesk-chat] Received unhandled chat update:', update);
          break;
      }
    });
  }
}

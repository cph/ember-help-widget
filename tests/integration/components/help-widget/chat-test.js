import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, find, findAll, render, triggerKeyEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import ChatMessage from '@cph/ember-help-widget/models/chat-message';
import ChatParticipant from '@cph/ember-help-widget/models/chat-participant';
import { resolve } from 'rsvp';
import { setupIntl } from 'ember-intl/test-support';

class MockChat extends Service {
  messages = [];
  participants = [];
  isOnline = true;
  joinedChat = true;

  markAllRead() { }
  setTyping() { }
  send() { return resolve(); }
}

let mockChat;

function makeMessage(msg, sender) {
  if (!sender) { return new ChatMessage({ msg }); }
  return new ChatMessage({
    msg,
    nick: sender.nickname,
    display_name: sender.displayName
  });
}

module('Integration | Component | help-widget/chat', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  hooks.beforeEach(function() {
    this.owner.unregister('service:zendesk-chat');
    this.owner.register('service:zendesk-chat', MockChat);

    mockChat = this.owner.lookup('service:zendesk-chat');
  });

  test('it renders', async function(assert) {
    await render(hbs`<HelpWidget::Chat @isShowing={{true}} />`);
    assert.ok(find('.ember-help-widget-zendesk-chat'));
  });

  test('it shows the current chat history', async function(assert) {
    const visitor = new ChatParticipant({ nick: 'visitor', display_name: 'Visitor 7357' });
    const agent = new ChatParticipant({ nick: 'agent', display_name: 'Agent Smith', title: 'Super Helpful', avatar_path: 'agent.jpg' });
    mockChat.messages = [ makeMessage('Hello', visitor), makeMessage('World', agent) ];
    await render(hbs`<HelpWidget::Chat @isShowing={{true}} />`);
    assert.equal(findAll('.ember-help-widget-chat-message').length, 2);
  });

  test('it allows sending a message', async function(assert) {
    const testMessage = 'Hello, World';
    mockChat.send = function(msg) {
      assert.equal(msg, testMessage);
      return resolve();
    }
    await render(hbs`<HelpWidget::Chat @isShowing={{true}} />`);
    await fillIn('.ember-help-widget-chat-message-input textarea', testMessage);
    await triggerKeyEvent('.ember-help-widget-chat-message-input textarea', 'keydown', 'Enter');
  });

  test('it prevents sending a message if offline', async function(assert) {
    const testMessage = 'Hello, World';
    mockChat.isOnline = false;
    mockChat.send = function() {
      assert.ok(false);
      return resolve();
    }
    await render(hbs`<HelpWidget::Chat @isShowing={{true}} />`);
    await fillIn('.ember-help-widget-chat-message-input textarea', testMessage);
    await triggerKeyEvent('.ember-help-widget-chat-message-input textarea', 'keyup', 'Enter');
    assert.ok(true);
  });

  test('it hides additional controls if not in a chat', async function(assert) {
    mockChat.joinedChat = false;
    await render(hbs`<HelpWidget::Chat @isShowing={{true}} />`);
    assert.equal(findAll('.ember-help-widget-chat-controls button').length, 0);
  });

  test('it allows rating a chat', async function(assert) {
    mockChat.rate = function(rating) { assert.equal(rating, 'good'); }
    await render(hbs`<HelpWidget::Chat @isShowing={{true}} />`);
    await click('.ember-help-widget-icon-thumbs-up');
  });

  test('it allows commenting on a rated chat', async function(assert) {
    const testFeedback = 'Soooo good!';
    mockChat.rating = 'good';
    mockChat.comment = function(feedback) { assert.equal(feedback, testFeedback); }
    await render(hbs`<HelpWidget::Chat @isShowing={{true}} />`);
    await click('.ember-help-widget-chat-edit-feedback-trigger');
    await fillIn('.ember-help-widget-chat-feedback-form', testFeedback);
    await triggerKeyEvent('.ember-help-widget-chat-feedback-form', 'keydown', 'Enter');
  });

  test('it allows leaving a chat', async function(assert) {
    mockChat.endChat = function() { assert.ok(true); }
    await render(hbs`<HelpWidget::Chat @isShowing={{true}} />`);
    await click('.ember-help-widget-leave-chat-button');
  });
});

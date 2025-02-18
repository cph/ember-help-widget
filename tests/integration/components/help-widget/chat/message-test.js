import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, find, findAll, render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import ChatMessage from '@cph/ember-help-widget/models/chat-message';
import ChatParticipant from '@cph/ember-help-widget/models/chat-participant';
import moment from 'moment';
import { setupIntl } from 'ember-intl/test-support';

class MockChat extends Service {
  messages = [];
  participants = [];
  isOnline = true;
}

let mockChat;
let visitor;
let agent;

module('Integration | Component | help-widget/chat/message', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  hooks.beforeEach(function() {
    this.owner.unregister('service:zendesk-chat');
    this.owner.register('service:zendesk-chat', MockChat);

    mockChat = this.owner.lookup('service:zendesk-chat');
    visitor = new ChatParticipant({ nick: 'visitor', display_name: 'Visitor 7357' });
    agent = new ChatParticipant({ nick: 'agent', display_name: 'Agent Smith', title: 'Super Helpful', avatar_path: 'agent.jpg' });

    mockChat.participants = [ visitor, agent ];
  });

  test('it shows the content of a status message', async function(assert) {
    this.set('testMessage', new ChatMessage({ msg: 'Hello, World' }));
    await render(hbs`<HelpWidget::Chat::Message @message={{this.testMessage}} />`);
    assert.equal(this.element.textContent.trim(), 'Hello, World');
  });

  test('it shows the content of text message from a participant', async function(assert) {
    this.set('testMessage', new ChatMessage({
      nick: visitor.nickname,
      display_name: visitor.displayName,
      msg: 'Hello, World'
    }));
    await render(hbs`<HelpWidget::Chat::Message @message={{this.testMessage}} />`);
    assert.equal(find('.ember-help-widget-chat-bubble').textContent.trim(), 'Hello, World');
  });

  test('it shows the display name of the sender', async function(assert) {
    this.set('testMessage', new ChatMessage({
      nick: visitor.nickname,
      display_name: visitor.displayName,
      msg: 'Hello, World'
    }));
    await render(hbs`<HelpWidget::Chat::Message @message={{this.testMessage}} />`);
    assert.equal(find('.ember-help-widget-chat-display-name').textContent.trim(), visitor.displayName);
  });

  test('it shows the title name of the sender if available', async function(assert) {
    this.set('testMessage', new ChatMessage({
      nick: agent.nickname,
      display_name: agent.display_name,
      msg: 'Hello, World'
    }));
    await render(hbs`<HelpWidget::Chat::Message @message={{this.testMessage}} />`);
    assert.equal(find('.ember-help-widget-chat-speaker-title').textContent.trim(), agent.title);
  });

  test('it shows the profile picture of the sender if available', async function(assert) {
    this.set('testMessage', new ChatMessage({
      nick: agent.nickname,
      display_name: agent.display_name,
      msg: 'Hello, World'
    }));
    await render(hbs`<HelpWidget::Chat::Message @message={{this.testMessage}} />`);
    assert.equal(find('.ember-help-widget-chat-speaker img')?.getAttribute('src'), agent.avatarUrl);
  });

  test('it shows the timestamp of the message if it is not a status message', async function(assert) {
    const now = moment();
    this.set('testMessage', new ChatMessage({
      nick: visitor.nickname,
      display_name: visitor.displayName,
      timestamp: now,
      msg: 'Hello, World'
    }));
    await render(hbs`<HelpWidget::Chat::Message @message={{this.testMessage}} />`);
    assert.equal(find('.ember-help-widget-chat-bubble')?.getAttribute('title'), now.format('MMMM D, YYYY h:mma'));
  });

  test('it does not duplicate the display name for multiple messages from the same sender', async function(assert) {
    mockChat.messages.push(new ChatMessage({
      nick: visitor.nickname,
      display_name: visitor.displayName,
      msg: 'Hello'
    }));
    mockChat.messages.push(new ChatMessage({
      nick: visitor.nickname,
      display_name: visitor.displayName,
      msg: 'World'
    }));
    this.set('testMessage', mockChat.messages[1]);
    await render(hbs`<HelpWidget::Chat::Message @message={{this.testMessage}} />`);
    assert.notOk(find('.ember-help-widget-chat-speaker'));
  });

  test('it shows buttons for a rating request', async function(assert) {
    this.set('testMessage', new ChatMessage({
      isRatingRequest: true,
      msg: 'Rate this chat'
    }));
    this.set('onRate', function() { });
    await render(hbs`<HelpWidget::Chat::Message @message={{this.testMessage}} @onRate={{this.onRate}} />`);
    assert.equal(findAll('.ember-help-widget-chat-status-buttons button').length, 2);
  });

  test('it allows submitting a rating for a rating request', async function(assert) {
    this.set('testMessage', new ChatMessage({
      isRatingRequest: true,
      msg: 'Rate this chat'
    }));
    this.set('onRate', function(rating) { assert.equal(rating, 'good'); });
    await render(hbs`<HelpWidget::Chat::Message @message={{this.testMessage}} @onRate={{this.onRate}} />`);
    await click('.ember-help-widget-chat-status-buttons button');
  });

  test('it allows submitting feedback for a rating request', async function(assert) {
    const testFeedback = 'Wonderful chat';
    mockChat.rating = 'good';
    this.set('testMessage', new ChatMessage({
      isRatingRequest: true,
      msg: 'Rate this chat'
    }));
    this.set('onRate', function() { });
    this.set('receiveFeedback', function(feedback) {
      assert.equal(feedback, testFeedback);
    });
    await render(hbs`<HelpWidget::Chat::Message @message={{this.testMessage}} @onRate={{this.onRate}} @onFeedback={{this.receiveFeedback}} />`);
    await fillIn('.ember-help-widget-chat-feedback-form', testFeedback);
    await triggerEvent('.ember-help-widget-chat-feedback-form', 'change');
  });

  test('it shows an attached image file inline', async function(assert) {
    const attachment = {
      url: 'image.png',
      mime_type: 'image/png',
      name: 'image.png',
      size: '1024'
    };
    this.set('testMessage', new ChatMessage({
      attachment,
      nick: visitor.nickname,
      display_name: visitor.displayName
    }));
    await render(hbs`<HelpWidget::Chat::Message @message={{this.testMessage}} />`);
    assert.ok(find('.ember-help-widget-chat-attachment-image img'));
  });

  test('it provides a link to an attached file', async function(assert) {
    const attachment = {
      url: 'image.png',
      mime_type: 'image/png',
      name: 'image.png',
      size: 1024
    };
    this.set('testMessage', new ChatMessage({
      attachment,
      nick: visitor.nickname,
      display_name: visitor.displayName
    }));
    await render(hbs`<HelpWidget::Chat::Message @message={{this.testMessage}} />`);
    assert.ok(find('a.ember-help-widget-chat-attachment-link'));
  });
});

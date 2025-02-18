import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, find, render } from '@ember/test-helpers';
import { animationsSettled } from 'ember-animated/test-support';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { setupIntl } from 'ember-intl/test-support';

class MockChat extends Service {
  connect() { }
  sendUserInfo() { }
}

let mockChat;

module('Integration | Component | help-widget', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  hooks.beforeEach(function() {
    this.owner.unregister('service:zendesk-chat');
    this.owner.register('service:zendesk-chat', MockChat);
    mockChat = this.owner.lookup('service:zendesk-chat');
  });

  test('it renders the toggle by default', async function(assert) {
    await render(hbs`<HelpWidget />`);
    assert.ok(find('.ember-help-widget-toggle'), 'Expected to find the toggle');
    assert.notOk(find('.ember-help-widget-container'), 'Expected not to find the content');
  });

  test('clicking the toggle shows the help center', async function(assert) {
    await render(hbs`<HelpWidget />`);
    await click('.ember-help-widget-toggle');
    await animationsSettled();
    assert.ok(find('.ember-help-widget-container'), 'Expected to find the content');
  });

  test('you can click the toggle to close the help center again', async function(assert) {
    await render(hbs`<HelpWidget />`);
    await click('.ember-help-widget-toggle');
    await animationsSettled();
    await click('.ember-help-widget-toggle');
    await animationsSettled();
    assert.notOk(find('.ember-help-widget-container'), 'Expected not to find the content');
  });

  test('clicking the navigation link takes you to a different view', async function(assert) {
    await render(hbs`<HelpWidget />`);
    await click('.ember-help-widget-toggle');
    await animationsSettled();
    await click('.ember-help-widget-navigation a');
    assert.ok(find('.ember-help-widget-feedback-view'), 'Expected to have loaded the feedback view');
  });

  test('closing and reopening the help center resets your view to the help view', async function(assert) {
    await render(hbs`<HelpWidget />`);
    await click('.ember-help-widget-toggle'); // Open
    await animationsSettled();
    await click('.ember-help-widget-navigation a'); // Navigate
    await click('.ember-help-widget-toggle'); // Close
    await animationsSettled();
    await click('.ember-help-widget-toggle'); // Re-open
    await animationsSettled();
    assert.ok(find('.ember-help-widget-help-view'), 'Expected to have reset to the help view');
  });

  test('opening the help center attempts to connect to ZD Chat', async function(assert) {
    mockChat.connect = () => { assert.ok(true); }
    await render(hbs`<HelpWidget />`);
    await click('.ember-help-widget-toggle'); // Open
    await animationsSettled();
  });
});

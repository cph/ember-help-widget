import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | help-widget/chat/uploader', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders a default label without a block', async function(assert) {
    await render(hbs`<HelpWidget::Chat::Uploader />`);
    assert.equal(this.element.textContent.trim(), 'Upload');
  });

  test('it renders a block if given', async function(assert) {
    await render(hbs`
      <HelpWidget::Chat::Uploader>
        Wacky Upload
      </HelpWidget::Chat::Uploader>
    `);
    assert.equal(this.element.textContent.trim(), 'Wacky Upload');
  });

  test('it calls an upload action with the file when changed', async function(assert) {
    const testFile = new Blob(['Test File']);
    this.set('testUpload', function(file) {
      assert.equal(file, testFile);
    });
    await render(hbs`<HelpWidget::Chat::Uploader @upload={{this.testUpload}} />`);
    await triggerEvent('input', 'change', { files: [ testFile ] });
  });

  test('it calls a didUpload action after uploading', async function(assert) {
    const testFile = new Blob(['Test File']);
    this.set('testUpload', function() { });
    this.set('testDidUpload', function() { assert.ok(true); });
    await render(hbs`<HelpWidget::Chat::Uploader @upload={{this.testUpload}} @didUpload={{this.testDidUpload}} />`);
    await triggerEvent('input', 'change', { files: [ testFile ] });
  });
});

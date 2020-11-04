import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | help-widget/icon', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders the given icon', async function(assert) {
    await render(hbs`<HelpWidget::Icon @name="thumbs-up" />`);
    assert.ok(find('svg'), 'Expected to find the SVG of an icon');
  });
});

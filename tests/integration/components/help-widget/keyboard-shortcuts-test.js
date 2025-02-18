import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | help-widget/keyboard-shortcuts', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders a row for each shortcut', async function(assert) {
    this.set('testShortcuts', [
      { action: 'Do the thing', combos: [['D']] },
      { action: 'Do another thing', combos: [['Shift', 'D'], ['Ctrl', 'D']] }
    ]);
    await render(hbs`<HelpWidget::KeyboardShortcuts @isShowing={{true}} @shortcuts={{this.testShortcuts}} />`);

    assert.equal(findAll('tr').length, 2);
    assert.equal(findAll('td').length, 4);
  });
});

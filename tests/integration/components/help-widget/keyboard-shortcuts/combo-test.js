import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

const combos = [[ 'Ctrl', 'F' ], [ 'Shift', 'Ctrl', 'F' ]];

module('Integration | Component | help-widget/keyboard-shortcuts/combo', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders the passed in combo', async function(assert) {
    this.set('testCombos', [ combos[0] ]);
    this.set('testCombo', combos[0]);
    await render(hbs`<HelpWidget::KeyboardShortcuts::Combo @combo={{this.testCombo}} @combos={{this.testCombos}} />`);
    assert.equal(this.element.textContent.trim(), 'CtrlF');
  });

  test('it appends "or" if it\'s not the last combo', async function(assert) {
    this.set('testCombos', combos);
    this.set('testCombo', combos[0]);
    await render(hbs`<HelpWidget::KeyboardShortcuts::Combo @combo={{this.testCombo}} @combos={{this.testCombos}} />`);
    assert.ok(/or/.test(this.element.textContent.trim()));
  });

  test('it does not append "or" if it is the last combo', async function(assert) {
    this.set('testCombos', combos);
    this.set('testCombo', combos[1]);
    await render(hbs`<HelpWidget::KeyboardShortcuts::Combo @combo={{this.testCombo}} @combos={{this.testCombos}} />`);
    assert.equal(this.element.textContent.trim(), 'ShiftCtrlF');
  });
});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn, find, render, triggerKeyEvent, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { resolve } from 'rsvp';
import { t } from 'ember-intl/test-support';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | help-widget/help', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it does not render anything unless it is showing', async function(assert) {
    await render(hbs`<HelpWidget::Help />`);
    assert.equal(this.element.textContent.trim(), '');
  });

  test('it renders no results if no suggestions are found', async function(assert) {
    await render(hbs`<HelpWidget::Help @isShowing={{true}} />`);
    assert.equal(find('h4').textContent.trim(), 'No Results');
  });

  test('it renders suggestions when supplied by the action', async function(assert) {
    this.set('supplySuggestions', function() {
      return resolve([
        { text: 'Suggestion 1', url: '#' }
      ]);
    });
    await render(hbs`<HelpWidget::Help @isShowing={{true}} @fetchSuggestions={{this.supplySuggestions}} />`);
    assert.equal(find('ol').textContent.trim(), 'Suggestion 1');
  });

  test('it renders links to search results when a search is performed', async function(assert) {
    const sampleQuery = 'a query';
    this.set('supplySearchResults', function(query) {
      assert.equal(query, sampleQuery);
      return resolve([
        { text: 'Result 1', url: '#' }
      ]);
    });
    await render(hbs`<HelpWidget::Help @isShowing={{true}} @performSearch={{this.supplySearchResults}} />`);
    await fillIn('input[type="search"]', sampleQuery);
    await triggerKeyEvent('input[type="search"]', 'keyup', 'Enter');
    await waitFor('ol');
    assert.equal(find('ol').textContent.trim(), 'Result 1');
  });

  test('it renders the help center link in the key ember-help-center.help-center-url', async function(assert) {
    await render(hbs`<HelpWidget::Help @isShowing={{true}} />`);
    const linkElement = find('[data-test-help-center-link] a');
    assert.ok(linkElement);
    assert.ok(linkElement.getAttribute('href').includes(t('ember-help-widget.help-center-url')));
  });

  test('it renders the help center link in the key provided via helpCenterUrlKey argument', async function(assert) {
    await render(hbs`<HelpWidget::Help @isShowing={{true}} @helpCenterUrlKey={{'alt-help-center-url'}} />`);
    const linkElement = find('[data-test-help-center-link] a');
    assert.ok(linkElement);
    assert.ok(linkElement.getAttribute('href').includes(t('ember-help-widget.alt-help-center-url')));
  });
});

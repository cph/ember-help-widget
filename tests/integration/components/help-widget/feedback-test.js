import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, find, render } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { hbs } from 'ember-cli-htmlbars';
import { resolve } from 'rsvp';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | help-widget/feedback', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it does not render if isShowing is false', async function(assert) {
    await render(hbs`<HelpWidget::Feedback />`);
    assert.equal(this.element.textContent.trim(), '');
  });

  test('it renders when isShowing is true', async function(assert) {
    await render(hbs`<HelpWidget::Feedback @isShowing={{true}} />`);
    assert.ok(find('.ember-help-widget-feedback-view'));
  });

  test('it submits feedback when send is pressed', async function(assert) {
    const testSubject = 'Very Important Feedback';
    const testBody = 'Keep testing';
    this.set('onFeedback', function({ subject, message }) {
      assert.equal(testSubject, subject);
      assert.equal(testBody, message);
      return resolve();
    });
    await render(hbs`<HelpWidget::Feedback @isShowing={{true}} @sendFeedback={{this.onFeedback}} />`);
    await fillIn('#__help_widget_feedback_subject', testSubject);
    await fillIn('#__help_widget_feedback_message', testBody);
    await click('button');
  });

  test('it does not allow submitting feedback if subject and body are blank', async function(assert) {
    this.set('onFeedback', function() {
      assert.ok(false, 'sendFeedback should not have been called');
      return resolve();
    });
    await render(hbs`<HelpWidget::Feedback @isShowing={{true}} @sendFeedback={{this.onFeedback}} />`);
    await click('button');
    assert.ok(true);
  });

  test('it includes the selected priority when sending feedback', async function(assert) {
    const testSubject = 'Very Important Feedback';
    const testBody = 'Keep testing';
    const testPriority = 'urgent';
    this.set('onFeedback', function({ priority }) {
      assert.equal(testPriority, priority);
      return resolve();
    });
    await render(hbs`<HelpWidget::Feedback @isShowing={{true}} @sendFeedback={{this.onFeedback}} />`);
    await fillIn('#__help_widget_feedback_subject', testSubject);
    await fillIn('#__help_widget_feedback_message', testBody);
    await selectChoose('#__help_widget_feedback_priority', "Urgent");
    await click('button');
  });
});

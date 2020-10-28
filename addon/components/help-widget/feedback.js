import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
import { resolve } from 'rsvp';
import { task } from 'ember-concurrency-decorators';

export default class HelpWidgetFeedbackComponent extends Component {
  priorities = Object.freeze([ 'low', 'normal', 'high', 'urgent' ]);

  @tracked subject = '';
  @tracked message = '';
  @tracked selectedPriority = 'normal';

  @tracked isSending = false;

  get sendDisabled() {
    return this.isSending || isBlank(this.subject) && isBlank(this.message);
  }

  @task
  *sendFeedbackTask() {
    this.isSending = true;
    try {
      yield (this.args.sendFeedback({
        subject: this.subject,
        message: this.message,
        priority: this.selectedPriority
      }) || resolve());
      this.resetForm();
    } finally {
      this.isSending = false
    }
  }

  @action setPriority(priority) {
    this.selectedPriority = priority;
  }

  @action send() {
    if (this.isSending || !this.args.sendFeedback) { return; }
    this.sendFeedbackTask.perform();
  }

  @action
  autofocus(el) {
    el.querySelector('textarea')?.focus();
  }

  resetForm() {
    this.subject = '';
    this.message = '';
    this.selectedPriority = 'normal';
  }
}

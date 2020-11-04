import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';
import { task } from 'ember-concurrency-decorators';

export default class HelpWidgetHelpComponent extends Component {
  @service intl;

  @tracked searchQuery = '';
  @tracked searchResults = [];
  @tracked suggestions = [];

  get helpCenterLink() {
    const url = this.intl.t('ember-help-widget.help-center-url');
    return this.intl.t('ember-help-widget.help.help-center', { url, htmlSafe: true });
  }

  @task
  *searchTask() {
    this.searchResults = yield (this.args.performSearch?.(this.searchQuery) || resolve([]));
  }

  @task
  *fetchSuggestionsTask() {
    this.suggestions = yield (this.args.fetchSuggestions?.(this.args.viewName) || resolve([]));
  }

  @action
  performSearch() { this.searchTask.perform(); }

  @action
  fetchSuggestions() { this.fetchSuggestionsTask.perform(); }

  @action
  autofocus(el) {
    el.querySelector('input[type="search"]')?.focus();
  }
}

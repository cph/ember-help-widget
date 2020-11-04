import Controller from '@ember/controller';
import { action } from '@ember/object';
import { Promise as EmberPromise } from 'rsvp';

export default class ApplicationController extends Controller {
  @action search(query) {
    return new EmberPromise(resolve => resolve([
      { text: `Result 1 for ${query}`, url: '#' },
      { text: `Result 2 for ${query}`, url: '#' },
      { text: `Result 3 for ${query}`, url: '#' }
    ]));
  }

  @action suggestions(query) {
    return new EmberPromise(resolve => resolve([
      { text: `Suggestion 1 for ${query}`, url: '#' },
      { text: `Suggestion 2 for ${query}`, url: '#' },
      { text: `Suggestion 3 for ${query}`, url: '#' }
    ]));
  }

  @action feedback({ subject, message, priority }) {
    return new EmberPromise(resolve => {
      console.log(`[feedback] subject: ${subject}`);
      console.log(`[feedback] message: ${message}`);
      console.log(`[feedback] priority: ${priority}`);
      resolve();
    });
  }
}

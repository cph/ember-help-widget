import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { resolve } from 'rsvp';

export default class HelpWidgetChatUploaderComponent extends Component {
  @tracked isUploading = false;

  @action
  selectNew({ target }) {
    if (!this.args.upload) { return; }

    const file = target.files[0];
    if (!file) { return; }

    this.isUploading = true;

    (this.args.upload(file) || resolve()).then(response => {
      this.args.didUpload?.(response);
    }).finally(() => {
      this.isUploading = false;
      target.value = '';
    });
  }
}

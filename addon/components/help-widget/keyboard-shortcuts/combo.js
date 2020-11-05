import Component from '@glimmer/component';

export default class HelpWidgetKeyboardShortcutsComboComponent extends Component {
  get needsConnector() {
    return this.args.combos.indexOf(this.args.combo) < (this.args.combos.length - 1);
  }
}

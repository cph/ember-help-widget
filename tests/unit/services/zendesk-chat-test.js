import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | zendesk-chat', function(hooks) {
  setupTest(hooks);

  // Since this wraps an exernal SDK, that depends on network communication,
  // actually testing it is rather difficult...
  test('it exists', function(assert) {
    let service = this.owner.lookup('service:zendesk-chat');
    assert.ok(service);
  });
});

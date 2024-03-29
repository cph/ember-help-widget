ember-help-widget
==============================================================================

It's the Help Widget from LSB -- chat and all -- extracted in a reusable addon.


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.28 or above
* Ember CLI v3.28 or above
* Node.js v16 or above

**NOTE:** Version 0.2.0 is a breaking change due to ember-auto-import moving to version 2.x from 1.x


Installation
------------------------------------------------------------------------------

```
ember install ember-help-widget
```


Usage
------------------------------------------------------------------------------

`ember-help-widget` supplies the `<HelpWidget />` component, which is the main
interface for adding the widget to an Ember app. The component expects a handful
of parameters:

* `@viewName` - This is the name of the view the user is currently on, which will appear in the header of the widget. This is also used for searching the help center for suggestions.
* `@performSearch` - The action for searching the help center for articles. It is passed the current search query and should return a promise that resolves to an array of result object, each of which should have a `url` field and a `text` field, indicating the URL and the title of the link to the help center, respectively.
* `@fetchSuggestions` - The action for fetching suggestions from the help center. It is passed the current view name and should return a promise that resolves to an array of result objects, which should have the same fields as above.
* `@sendFeedback` - The action for sending feedback. It is passed an object containing a `subject` line, the `message` itself, and a `priority`, which will be one of "low", "normal", "high", or "urgent". It is expected to return a promise, though the promise need not resolve to any particular value.
* `@zendeskChatKey` - The API key from Zendesk for accessing the Chat SDK
* `@chatTags` - An array of tags to assign to chat conversations in Zendesk
* `@currentUserName` - The name of the current user. This is primarily used to auto-populate the info into chat sessions.
* `@currentUserEmail` - The email of the current user. As above, this is primarily for auto-populating into chat sessions.
* `@keyboardShortcuts` - Optional. An array of objects representing keyboard shortcuts for the current view. Each shortcut object should have an `action`, which describes the action the shortcut will take, as well as a `combos` array, each of which is itself an array of string representing the keys comprising the keyboard shortcut's chord. `combos` is an array, as you could have multiple chords that invoke the same action.
* `@helpCenterUrlKey` - Optional.  Defaults to `help-center-url`.  The key must be defined under `ember-help-widget`.

The addon leverages `ember-intl` for internationalization of all strings, which
can be overridden by translations for the consuming app. Of particular note are a
couple translation keys which are intended to _always_ be overridden:

* `ember-help-widget.help-center-url` - The URL that will link to the app's help center
* `ember-help-widget.contact-phone-number` - A phone number to call for support


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).

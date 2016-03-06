
# Making a Module

## Defines

Just a simple introducing of interfaces declared in the [DefinitelyTyped File]

[DefinitelyTyped File]: ../typings/tinyacc/tinyacc.d.ts

### Profile

An object that has necessary fields that describe a [Module].

### Module

Something able to create [Instance] and provides [Profile] to TinyAccelerator.

Usually it is a Chrome extension.

### Instance

Created by a [Module] when user makes a selection.

Its contents vary according to user's selection. To learn more, read [Make a Instance]

[Make a Instance]: make-a-instance.md

## Workflow

### When user makes a selection

```sequence
User->TinyAcc:     Selection
TinyAcc->Module:   Extracted content
Note over Module:  Generate corresponding content (*)
Module->TinyAcc:   Instance
TinyAcc->User:     Display
```

(\*) If can't generate content, a module may not respond to System and the flow stops.

### When content get unselected

The box will be hidden. The view and button that assigned to the Instance, will be removed from the box.

You may use `<script>` tags, but please try not to create references to the button or view.
Static content is always the best, or GC and memory might give you a bad day.

## Implement

Here is an example/quickstart implement: <https://github.com/laobubu/TinyAccExampleModule/>

### Connect to TinyAccelerator

TinyAccelerator and external modules follow Chrome Message API: <https://developer.chrome.com/extensions/messaging>

When a module starts, it shall open a `"module"` Port to TinyAccelerator and send its corresponding [Profile].

```javascript
const TinyAccelerator_ID = "fiddpgbhifocnehnnmkaodlabdbdpbjh"
const Profile = {...}

var port = chrome.runtime.connect(TinyAccelerator_ID, {name: "module"})
port.postMessage({
	type: "profile",
	profile: Profile
})
```

### Respond

When user make a selection, TinyAccelerator will request for an [Instance] via the `port`.

The requesting message contains a `request` field, whose type is [InstanceRequest].

```javascript
port.onMessage.addListener(function(msg) {
	if (msg.type === "request") {
		var request = msg.request // a InstanceRequest object
		var instance = __________ // a Instance object
		if (instance !== null) {
			port.postMessage({
				type: "instance",
				instance: instance
			})
		}
	}
})
```


[Module]: #module
[Profile]: #profile
[Instance]: #instance
[InstanceRequest]: ../typings/tinyacc/tinyacc.d.ts#L47

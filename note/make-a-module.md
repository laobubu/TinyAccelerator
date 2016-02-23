
# Making a Module

## Defines

### Profile

An object that has necessary fields that describe a [Module].

### Module

Something able to create [Instance] and provides [Profile] to TinyAccelerator.

Usually it is a Chrome extension.

### Instance

Created by a [Module] when user makes a selection.

Its contents vary according to user's selection.

## Workflow

### When user makes a selection

```sequence
User->TinyAcc:     Selection
TinyAcc->Module:   Extracted content
Note over Module:  Generate corresponding content (*)
Module->TinyAcc:   Instance
TinyAcc->User:     Display
```

(\*) If can't generate corresponding content, Module may refuse responding System and the flow stops.

### When content get unselected

The box will be hidden. The view and button that assigned to the Instance, will be removed from the box.

The best practice is that not creating more reference to the button or view. Once their content get updated, everything shall be static. Otherwise, GC and memory might have a bad day.

## Implement

### Connect to TinyAccelerator

TinyAccelerator and external modules follow Chrome Message API: <https://developer.chrome.com/extensions/messaging>

When a module starts, it shall make a connection to TinyAccelerator and send its corresponding [Profile].

```javascript
const TinyAccelerator_ID = "xxxxxxxxxxxxxxxxxxxxxxxx"
const Profile = {...}

var port = chrome.runtime.connect(TinyAccelerator_ID, {name: Profile.name})
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
	else if (msg.type === "profile") {
		port.postMessage({
			type: "profile",
			profile: Profile
		})
	}
})
```



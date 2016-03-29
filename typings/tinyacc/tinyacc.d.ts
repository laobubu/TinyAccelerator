declare module TinyAcc{

interface Profile {
	/** the ID name, like `SearchEngine`, only letters and numbers */
	id: string;
	
	/** the name of this accelerator. i18n */
	name: string;
	
	/** the author's name */
	author: string;
	
	/** one stentece describes this accelerator. */
	description: string;
	
	/** the URL to this accelerator's homepage */
	url?: string;
	
	/** the full description. Markdown is supported. */
	fullDescription?: string;
	
	/** the 48x48 image URL. base64 URL is supported. */
	image?: string;
	
	/** the options page URL. for example, `chrome-extension://xxxxxxxxx/options.html` */
	options?: string;
}

/** 
 * The event handlers
 * 
 * @see /note/make-a-instance.md
 */
type EventInfo = { [eventName: string]: string };

/** the `this` object of functions that generated from EventInfo */
interface InstanceEventThis {
	button: HTMLElement;
	view: HTMLElement;
}

interface Instance {
	/** the view */
	view?: string | {
		html: string;
		event?: EventInfo;
	};
	
	/** the entry button on #entry */
	button: {
		/** the text on the button. if empty, the button will be hidden */
		text?: string;
		
		/** the event handler function bodies */
		event?: EventInfo;
	}
	
	/** the id string. given when TinyAcc requests for this instance */
	id: string;
	
	/** the js content that runs when button and view are created. `this.view` and `this.button` are available. */
	onCreated?: string;
}

interface InstanceRequest {
	/** something Instance shall return as-is */
	id: string;
	
	/** the selected text */
	text: string;
	
	/** the selected HTML */
	html: string;
	
	/** the page URL */
	url: string;
}

}

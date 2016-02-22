declare module TinyAcc{

interface Profile {
	/** the name of this accelerator */
	name: string;
	
	/** the author's name */
	author: string;
	
	/** the URL to this accelerator's homepage */
	url: string;
	
	/** one stentece describes this accelerator. */
	description: string;
	
	/** the full description. HTML tags are supported. */
	fullDescription: string;
	
	/** the 48x48 image URL. base64 URL is supported. */
	image: string;
}

interface Instance {
	/** the HTML of the View */
	view?: string;
	
	/** the title of button. usually the same as Profile.name */
	title: string;
	
	/** the id string. given when TinyAcc requests for this instance */
	id: string;
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

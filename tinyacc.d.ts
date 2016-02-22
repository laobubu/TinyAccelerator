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
	
	/** 
	 * true and TinyAcc will pass the HTML, instead of text, of the selected content, to this accelerator.
	 * 
	 * However, if useHTML is true, the `create` will **never** be called when user types the query manually.
	 */
	useHTML: boolean;
}

interface Instance {
	/** the HTML of the View */
	view?: string;
	
	/** the title of button. usually the same as Profile.name */
	title: string;
}

}

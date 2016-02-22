interface TAcceleratorProfile {
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
	
	/**
	 * tell if this accelerator **might** need a view. 
	 * 
	 * - When true, an instance can also refuse using the view.
	 * - But if false, it will never get the view.
	 */
	hasView: boolean;
}

interface TAcceleratorFactory {	
	/** 
	 * when user created a selection, TinyAcc will use this function to create an instance. 
	 * 
	 * If the selected content is not supported, this function shall return `null`
	 * 
	 * When TinyAcc gets the instance, the `TAccelerator.bind()` will be called.
	 */
	create(selectedContent): TAccelerator;
}

interface TAccelerator {
	/** 
	 * when a TAccelerator is created, TinyAcc will call this function. 
	 * 
	 * @param {HTMLElement} button the button assigned to this accelerator. You shall modify its content by adding some text or other stuff.
	 * @param {HTMLDivElement} view 
	 */
	bind(button: HTMLElement, view: HTMLDivElement);
}

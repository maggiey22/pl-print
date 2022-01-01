import parse5 from "parse5";
import https from "https";

export default class App {
	/**
	 * Get full PrairieLearn link
	 * @param internalLink should look like "/pl/course_instance/xxx/instance_question/yyy"
	 * @returns full PL link
	 */
	public getFullPLLink(internalLink: string): string {
		return `https://ca.prairielearn.com${internalLink}`;
	}

	/**
	 *
	 * @param link PL link to access
	 * @param cookie PL authentication cookie
	 * @returns Promise<string> with HTML content
	 */
	public getHTMLStringFromPLLink(link: string, cookie: string = ""): Promise<string> {
		const options: any = {
			headers: {
				Cookie: `pl_authn=${cookie}`,
			},
		};

		// Adapted from https://stackoverflow.com/a/65464233/13488316
		return new Promise((resolve, reject) => {
			https
				.get(link, options, function (res) {
					res.setEncoding("utf8");

					switch (res.statusCode) {
						case 200: {
							res.on("data", function (data) {
								resolve(data);
							});
							break;
						}
						default: {
							reject("Bad status code: " + res.statusCode);
							break;
						}
					}
				})
				.on("error", function (err) {
					console.error(err);
					reject(err);
				});
		});
		// From https://stackoverflow.com/a/59765624/13488316
		/*
        // https://stackoverflow.com/questions/70209010/testing-with-mocha-node-fetch-typescript-gives-strange-error
        // using node-fetch still does not work with mocha
        return fetch(link)
			.then((response: any) => {
				switch (response.status) {
					// status "OK"
					case 200:
						return response.text();
					// status "Not Found"
					case 404:
						throw response;
				}
			})
			.catch((err: any) => {
				console.error(`ERROR: ${err}`);
				throw err;
			}); */
	}

	// TODO open root PL link with auth
	public getHTMJSON(link: string, cookie: string = ""): Promise<any> {
		// TODO check valid course_instance/xxx/assessment_instance/zzz link
		return this.getHTMLStringFromPLLink(link, cookie)
			.then((content) => parse5.parse(content))
			.catch((err) => {
				console.error(err);
				throw err;
			});
	}

	// TODO get title
	// public getTitle(pageHTMJSON: any): Promise<any> {
	//     return pageHTMJSON.
	// }

	// Helper
	private getChildNode(childNodes: any[], nodeName: string, nth: number = 0): any {
		let pos: number = 0;
		if (childNodes !== undefined) {
			for (const childNode of childNodes) {
				if (childNode.nodeName === nodeName) {
					if (pos === nth) {
						return childNode;
					}
					pos += 1;
				}
			}
		}
		return undefined;
	}

	private lookupAttr(theNode: any, attr: string): any {
		for (const theAttr of theNode.attrs) {
			if (theAttr.name === attr) {
				return theAttr.value;
			}
		}
		return undefined;
	}

	private findTableHelper(theNode: any): any {
		const theChildNodes: any[] = theNode.childNodes;
		const expectedTableClassAttr: string = "table table-sm table-hover";

		const theTable: any = this.getChildNode(theChildNodes, "table");

		// Base case
		if (theTable !== undefined && this.lookupAttr(theTable, "class") === expectedTableClassAttr) {
			return theTable;
			// Recursive case
		} else if (theChildNodes !== undefined) {
			for (const childNode of theChildNodes) {
				const result = this.findTableHelper(childNode);
				if (result !== undefined) {
					return result;
				}
			}
		}
		return undefined;
	}

	// TODO navigate to table and get first question
	public getQuestionTableNode(pageHTMJSON: any): any {
		const htmlNode: any = this.getChildNode(pageHTMJSON.childNodes, "html");
		const bodyNode: any = this.getChildNode(htmlNode.childNodes, "body");

		const theTable: any = this.findTableHelper(bodyNode);
		// TODO Find the parent node of <th>Question</th>
		return theTable;
	}

	public getQuestion1Link(tableHTMJSON: any): string | undefined {
		const tbody: any = this.getChildNode(tableHTMJSON.childNodes, "tbody");
		// Needs to be 1 to skip over the header row
		const question1Tr: any = this.getChildNode(tbody.childNodes, "tr", 1);
		const question1Td: any = this.getChildNode(question1Tr.childNodes, "td");
		const question1Anchor: any = this.getChildNode(question1Td.childNodes, "a");

		const theHref: string | undefined = this.lookupAttr(question1Anchor, "href");
		return theHref;
	}

	// TODO get next question node
	public getNextQuestionNode() {}

	// TODO navigate to next question

	// TODO compose html into one full html

	// TODO put html in printable pdf
}

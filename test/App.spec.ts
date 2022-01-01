import {expect} from "chai";
import * as fs from "fs-extra";
import App from "../src/App";

describe("App", () => {
	let app: App;

	before(() => {
		app = new App();
	});

	it("Should get HTML from PL", async () => {
		const app: App = new App();
		const quizlink: string =
			process.env.PL_QUIZ_LINK === undefined ? expect.fail("Bad .env") : process.env.PL_QUIZ_LINK;

		const result: any = await app.getHTMJSON(quizlink, process.env.COOKIE);
		const tableNode: any = app.getQuestionTableNode(result);
		const question1Link: string | undefined = app.getQuestion1Link(tableNode);

		if (question1Link === undefined) expect.fail("Could not find Question 1 link");

		const fullQuestion1Link: string = app.getFullPLLink(question1Link);
		const question1HTMJSON: any = await app.getHTMJSON(fullQuestion1Link, process.env.COOKIE);
		// console.log(question1HTMJSON);
		// console.log(result);
		// console.log(app.getQuestionTableNode(result));
	});

	it("Should get HTML from PL homepage", () => {
		return app.getHTMLStringFromPLLink("https://ca.prairielearn.com/pl", process.env.COOKIE).catch((err) => {
			expect.fail(err);
		});
	});

	it("Should get HTML from random homepage", () => {
		return app
			.getHTMLStringFromPLLink("https://www.cse.unsw.edu.au/~billw/dictionaries/prolog/index.html")
			.then((result) => {
				const expected: string = fs.readFileSync("./test/resources/The Prolog Dictionary.html").toString();
				expect(result).to.equal(expected);
			})
			.catch((err) => {
				expect.fail(err);
			});
	});
});

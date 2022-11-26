type Routes = {
	"/": null;
	"/flower": null;
	"/profile/[contact]": {
		"contact": string;
	},
	"/profile/[contact]/delete/[id]": {
		"contact": string;
		"id": string;
	}
}

export function getPath<Route extends keyof Routes>
	(
		...args: Routes[Route] extends null ?
			[route: Route]
			: [route: Route, params: Routes[Route]]
	) {
	const [route, params] = args;
	console.log(route, params);
}

getPath("/profile/[contact]/delete/[id]", {
	contact: "asdfasdfasdf",
	id: "hey"
})


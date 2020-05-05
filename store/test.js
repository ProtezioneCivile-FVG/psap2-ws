const store = require('./index.js');

let db = new store.Store();


async function test() {
	debugger;
	let r = await db.setupDB();
}


test();
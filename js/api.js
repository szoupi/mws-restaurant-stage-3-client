function mapData(obj) {
	const result = obj.map(x => x = x)
	console.log('result: ' + result);
}

//needs testing
function convertObjToArray(obj) {
	const iterable = obj[Symbol.iterator]()
	console.log('iterable contains:');
	console.log(...iterable);

	const myArray = []

	return myArray.push(function loopNext(arrayItem) {
		if (iterable.next().done == true) {
			console.log('iterable is false. end looping');
			return
		}
		console.log('looping, iterable value is: ' + arrayItem);
		return iterable.next().value
			.then(loopNext) // loop until done==false
	})
}

function logData(data) {
	data.forEach(dataItem => {
		for (let dataItem of data) {
			console.log('ul dataItem: ' + dataItem.name);
		}
	})
}
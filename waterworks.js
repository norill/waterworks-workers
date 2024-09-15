const well = "\u{1F573}"
const sump = "\u{26F2}"
var people = []
var effectivePeople = []
var wells = []
var carriersCount
var wagonsCount
var carts
var efficency
var watersC
var supplyHere
var supplyNear
var watersForCarriers
var watersForWagons

function place() {
	readInputs()
	calculateEffectivePeople()
	let carriers = new Array(carriersCount).fill(0)
	let wagons = new Array(wagonsCount).fill(0)

	let bestInfluence = -333
	let bestCarriers = []
	let bestWagons = []

	let carrierPlacements = placements[carriersCount]
	let wagonPlacements = placements[wagonsCount]

	watersForCarriers = watersC[carriersCount]
	watersForWagons = waters[2][wagonsCount]

start = + new Date();
let d = 1
	
	for (let i = 0, len = carrierPlacements.length; i < len; i++)
		for (let j = 0, len2 = wagonPlacements.length; j < len2; j++) {
			let influence = calculateInfluenceFast(i, j)
			if (influence > bestInfluence) {
				bestInfluence = influence
				bestCarriers = carrierPlacements[i].slice()
				bestWagons = wagonPlacements[j].slice()
				if (influence === 20) {
					i = len
					break
				}
			}
			++d
		}

	console.log(d)
	console.log(new Date() - start)
	document.getElementById("influence").innerText = bestInfluence
	displayPlacement(bestCarriers, bestWagons)
}

function calculateInfluence(carriers, wagons) {
	let influence = 0

	for (let i = 0; i < 20; i++) {
		let near = nearMasks[i]
		let nearLength = near.length
		let water = 0
		for (let j = 0, len = carriers.length; j < len; j++) {
			let c = carriers[j]
			if(c === i)
				water += supplyHere
			else if((near & 1<<c) !== 0)
				water += supplyNear
		}
		for (let j = 0, len = wagons.length; j < len; j++) {
			let c = wagons[j]
			if(c === i)
				water += 8
			else if((near & 1<<c) !== 0)
				water += 6
		}

		let delta = water - effectivePeople[i]
		if (delta >= 0) 
			influence += 1
		else if (delta < -1) 
			influence += -2
	}

	return influence;
}

function calculateInfluenceFast(j, k) {
	let influence = 0
	
	let carrierWaters = watersForCarriers[j]
	let wagonWaters = watersForWagons[k]

	for (let i = 0; i < 20; i++) {
		let delta = carrierWaters[i] + wagonWaters[i] - effectivePeople[i]
		if (delta >= 0) 
			influence += 1
		else if (delta < -1) 
			influence += -2
	}

	return influence;
}

function displayPlacement(carriers, wagons) {
	for (let i = 0; i < 20; i++)
		document.getElementById("plot"+i+"span").innerText=""
	
	for (let i = 0; i < carriers.length; i++) {
		document.getElementById("plot"+carriers[i]+"span").innerText+="\u{1F9D1}"
	}

	for (let i = 0; i < wagons.length; i++) {
		document.getElementById("plot"+wagons[i]+"span").innerText+="\u{1F434}"
	}

	let population = 0
	for (let i = 0; i < 20; i++) {
		let near = nearMasks[i]
		let nearLength = near.length
		let water = 0
		for (let j = 0, len = carriers.length; j < len; j++) {
			let c = carriers[j]
			if(c === i)
				water += supplyHere
			else if((near & 1<<c) !== 0)
				water += supplyNear
		}
		for (let j = 0, len = wagons.length; j < len; j++) {
			let c = wagons[j]
			if(c === i)
				water += 8
			else if((near & 1<<c) !== 0)
				water += 6
		}

		population += people[i]

		let td = document.getElementById("plot"+i+"span").parentNode.style
		let delta = water - effectivePeople[i]
		if (delta >= 0) 
			td.borderColor = "#56c229"
		else if (delta < -1) 
			td.borderColor = "#c23429"
		else
			td.borderColor = "#ffd800"
	}

	document.getElementById("population").innerText = population
}

function calculateEffectivePeople() {
	effectivePeople = people.slice()

	for (let i = 0; i < 32; i++) {
		if (wells[i] === well) {
			for (let j = 0; j < nearWells[i].length; j++) {
				effectivePeople[nearWells[i][j]] -= 2;
			}
		} else if (wells[i] === sump) {
			for (let j = 0; j < nearWells[i].length; j++) {
				effectivePeople[nearWells[i][j]] -= efficiencies[efficency][i];
			}
		}
	}
}

function readInputs() {
	for (let i = 0; i < 20; i++) {
		people[i] = document.getElementById("plot"+i).valueAsNumber
	}
	for (let i = 0; i < 32; i++) {
		let text = document.getElementById("well"+i).innerText
		wells[i] = text.startsWith("+") ? "" : text
	}
	carriersCount = document.getElementById("carriers").valueAsNumber
	wagonsCount = document.getElementById("wagons").valueAsNumber
	efficency = document.getElementById("efficency").valueAsNumber
	carts = document.getElementById("carts").checked
	if (carts) {
		supplyHere = 3
		supplyNear = 2
		watersC = waters[1]
	} else {
		supplyHere = 2
		supplyNear = 1
		watersC = waters[0]
	}

	saveInputs()
}

function saveInputs() {
	localStorage.setItem("people", JSON.stringify(people))
	localStorage.setItem("wells", JSON.stringify(wells))
	localStorage.setItem("carriersCount", carriersCount)
	localStorage.setItem("wagonsCount", wagonsCount)
	localStorage.setItem("efficency", efficency)
	localStorage.setItem("carts", carts)
}

function writeInputs() {
	if (!loadInputs()) 
		return

	for (let i = 0; i < 20; i++) {
		document.getElementById("plot"+i).valueAsNumber = people[i]
	}
	for (let i = 0; i < 32; i++) {
		document.getElementById("well"+i).innerText = wells[i]
	}

	document.getElementById("carriers").valueAsNumber = carriersCount
	document.getElementById("wagons").valueAsNumber = wagonsCount
	document.getElementById("efficency").valueAsNumber = efficency
	document.getElementById("carts").checked = carts
	updateEfficency()
}

function loadInputs() {
	if (localStorage.getItem("carts") === null)
		return false
	
	people = JSON.parse(localStorage.getItem("people"))
	wells = JSON.parse(localStorage.getItem("wells"))
	carriersCount = localStorage.getItem("carriersCount")
	wagonsCount = localStorage.getItem("wagonsCount")
	efficency = localStorage.getItem("efficency")
	carts = localStorage.getItem("carts")
	return true
}

function updateEfficency() {
	efficency = document.getElementById("efficency").valueAsNumber
	let eff = efficiencies[efficency]

	for (let i = 0; i < 32; i++) {
		let text = document.getElementById("well"+i).innerText
		if (text !== well && text !== sump)
			document.getElementById("well"+i).innerText = "+" + eff[i]
	}

	saveInputs()
}

function cycle(td) {
	if (td.innerText === sump) {
		td.innerText = well
		td.title = "well"
	} else if (td.innerText === well) {
		td.innerText = ""
		td.title = ""
	} else {
		td.innerText = sump
		td.title = "sump"
	} 
}

function onload() {
	writeInputs()
	document.getElementById("place").disabled = true
	// waters = [[], [], [], ]
	// placements = [[],[],[],[],[],[],[],[],]
	loadScript("placements.js",loadComplete)
	loadScript("waters.js",loadComplete)
}

function loadComplete() {
	if (typeof waters !== 'undefined' && typeof placements !== 'undefined') {
		let button = document.getElementById("place")
		button.value = "Place"
		button.disabled = false
	}
}

function loadScript(url, callback) {
   var head = document.getElementsByTagName('head')[0];
   var script = document.createElement('script');
   script.type = 'text/javascript';
   script.src = url;

   script.onreadystatechange = callback;
   script.onload = callback;

   head.appendChild(script);
}

let nearMasks = [
	1<<1 | 1<<6,
	1<<0 | 1<<2 | 1<<8,
	1<<1 | 1<<3 | 1<<9,
	1<<2 | 1<<4 | 1<<10 | 1<<11,
	1<<3 | 1<<5 | 1<<12,
	1<<4 | 1<<13,
	1<<0 | 1<<7 | 1<<8,
	1<<6 | 1<<8 | 1<<14,
	1<<1 | 1<<6 | 1<<7 | 1<<9 | 1<<15,
	1<<2 | 1<<8 | 1<<10 | 1<<16,
	1<<3 | 1<<9 | 1<<11 | 1<<17,
	1<<3 | 1<<10 | 1<<12 | 1<<17,
	1<<4 | 1<<11 | 1<<13 | 1<<18,
	1<<5 | 1<<12 | 1<<19,
	1<<7 | 1<<15,
	1<<8 | 1<<14 | 1<<16,
	1<<9 | 1<<15 | 1<<17,
	1<<10 | 1<<11 | 1<<16 | 1<<18,
	1<<12 | 1<<17 | 1<<19,
	1<<13 | 1<<18,
]

let nearWells = [
	[0],
	[0, 1],
	[1, 2],
	[2, 3],
	[3, 4],
	[4, 5],
	[5],
	[0, 6],
	[0, 1, 6, 8],
	[1, 2, 8, 9],
	[2, 3, 9, 10],
	[3, 10, 11],
	[3, 4, 11, 12],
	[4, 5, 12, 13],
	[5, 13],
	[6, 7],
	[6, 7, 8],
	[7, 14],
	[7, 8, 14, 15],
	[8, 9, 15, 16],
	[9, 10, 16, 17],
	[10, 11, 17],
	[11, 12, 17, 18],
	[12, 13, 18, 19],
	[13, 19],
	[14],
	[14, 15],
	[15, 16],
	[16, 17],
	[17, 18],
	[18, 19],
	[19],
]

let efficiencies = [
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 2, 2, 3, 4, 4, 1, 1, 2, 2, 3, 3, 4, 4, 1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 1, 1, 2, 2, 3, 4, 4],
	[3, 3, 4, 4, 5, 5, 5, 3, 3, 4, 4, 5, 5, 5, 5, 3, 3, 3, 3, 4, 4, 5, 5, 5, 5, 3, 3, 4, 4, 5, 5, 5],
	[5, 5, 6, 6, 6, 6, 6, 5, 5, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 5, 5, 6, 6, 6, 6, 6],
	[7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
	[8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
	[9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
	[10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
	[11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11],
]


//util

function generatePlacements(len) {
	let carriers = new Array(len).fill(0)
	let placements = []
	let i = len-1

	while (true) {
		placements.push(carriers.slice())
		while (++carriers[i--] === 20)
			;

		if (i < -1)
			break
		
		while (++i < len-1){
			carriers[i+1] = carriers[i]
		}
	}
	// console.log(JSON.stringify(placements).length);
	return placements
}

function placement2water(placement, supplyHere, supplyNear) {
	let water = new Array(20).fill(0)
	for (let i = 0; i < 20; i++) {
		let near = nearMasks[i]
		let nearLength = near.length
		for (let j = 0, len = placement.length; j < len; j++) {
			let c = placement[j]
			if(c === i)
				water[i] += supplyHere
			else if((near & 1<<c) !== 0)
				water[i] += supplyNear
		}
	}

	return water;
}

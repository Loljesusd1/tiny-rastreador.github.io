const totalMetrics = document.getElementsByClassName("number-total-metrics");
var slots;

async function getBalance() {
    console.log("Getting wallet balance...");
    var result;
    await axios.get(
        "https://api.bscscan.com/api"
        +"?module=account"
        +"&action=tokenbalance"
        +"&contractaddress=0xe9e7cea3dedca5984780bafc599bd69add087d56"
        +"&address=0x75c76A207020E2b20ba7e97225f1483C46E2430b"
        +"&tag=lastest"
        +"&apikey=CWZ5AVKC4FVWNNRJQXENIPIU457W8TR6SK")
    .then(function(data) {
        console.log(data);
        result = parseInt(data.data.result) * 1E-18;
    })
    .catch(err=>console.log(err))
    return result;
}

/*TODO
- Crear esta función para actualizar los slots disponibles a cargar la página
- Ver de utilizar un archivo ".log" en lugar de analizar la base de datos
*/
function updateAvailableSlots(availableSlots) {
	console.log("Updating slots...");
	if (slots == undefined) {
		const obtainer = new XMLHttpRequest();
		obtainer.open("GET", "http://localhost:5000", true);
		obtainer.addEventListener("load", () => {
			let occupiedSlots = JSON.parse(obtainer.response).result.length;
			availableSlots = 2500 - occupiedSlots;
			totalMetrics.item(1).innerHTML = `${availableSlots} of 2500`;
		})
		obtainer.send();
	} else {
		totalMetrics.item(1).innerHTML = `${availableSlots} of 2500`;
	}
}

/*TODO:
- Implementar web3
- Cambiar los alerts por elementos <p>
- Implementar error handling
*/
function checkWallet() {
	console.log("test 2 started");
	const wallet = document.querySelector(".wallet-input").value;
	var isWhitelisted = false;
	const obtainer = new XMLHttpRequest();
	obtainer.open("GET", "http://localhost:5000", true);
	obtainer.addEventListener("load", (data) => {
		console.log(obtainer.response);
		const transactions = JSON.parse(obtainer.response).result;
		for (let i = transactions.length - 1; i >= 0; i--) {
			console.log(transactions[i][0]);
			if (wallet == transactions[i][0]) {
				isWhitelisted = true;
			}
		}
		if (isWhitelisted == true) {
			alert("You donated :D");
		} else {
			alert("You haven't donated :(");
		}
	})
	obtainer.send()
	
}

/*TODO:
- Hacer string formatting en el alert
- Implementar txHash-input
- Implementar comprobador
- Implementar error handling
*/
function test3() {
	console.log("test 3 started");
	const inserter = new XMLHttpRequest();
	inserter.open("POST", "http://localhost:5000", true);
	inserter.setRequestHeader("Content-type", "text/plain");
	inserter.addEventListener("load", (data) => {
		console.log(inserter.response);
		alert("TxHash ${txhash} successfully added to the database");
	})
	inserter.send("0xt35T1Ng");
}

function startVerifier() {
	var updater = setInterval(function() {
		updateAvailableSlots();
		getBalance()
		.then((result) => {
			totalMetrics.item(0).innerHTML = `${result}` + " of 50.000";
		})    
	}, 35000);
}

window.addEventListener("load", function() {
    getBalance()
    .then((result) => {
        totalMetrics.item(0).innerHTML = `${result}` + " of 50.000";
    })
	updateAvailableSlots();
	startVerifier();
});

document.querySelector(".submit-wallet").addEventListener("click", () => {checkWallet()});
document.querySelector(".submit-txhash").addEventListener("click", () => {test3()});
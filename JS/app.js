/*Arreglo con los elementos que muestran las métricas:
0 = BUSD recaudados hasta ahora.
1 = Espacios de donación restantes.*/
const totalMetrics = document.getElementsByClassName("number-total-metrics");

//Inicialización de web3 con base en la Binance Smart Chain (BSC).
const bscweb3 = new Web3("https://bsc-dataseed1.binance.org:443");

//API de producción.
const tinyapi = "https://tinyapi-online.herokuapp.com/";

//API de pruebas.
//const tinyapi = "http://localhost:5000";

function updateBalance() {
	/*Actualiza el balance actual en BUSD de la billetera de donaciones
	haciendo uso del API de bscscan.*/
    console.log("Getting wallet balance...");
	let bscApi = `
		https://api.bscscan.com/api
		?module=account
		&action=tokenbalance
		&contractaddress=0xe9e7cea3dedca5984780bafc599bd69add087d56
		&address=0x75c76A207020E2b20ba7e97225f1483C46E2430b
		&tag=lastest
		&apikey=CWZ5AVKC4FVWNNRJQXENIPIU457W8TR6SK
	`
	const obtainer = new XMLHttpRequest();
	obtainer.open("GET", bscApi, true);
	obtainer.addEventListener("load", () => {
		let result = parseInt(JSON.parse(obtainer.response).result) * 1E-18;
		totalMetrics.item(0).innerHTML = `${result}` + " of 50.000";

	})
	obtainer.send();
}

function updateAvailableSlots() {
	/*Actualiza los slots disponibles actualmente basado en las filas
	existentes dentro de la base de datos.*/
	console.log("Updating slots...");
	const obtainer = new XMLHttpRequest();
	obtainer.open("GET", tinyapi, true);
	obtainer.addEventListener("load", () => {
		let availableSlots = 2500 - JSON.parse(obtainer.response).result.length;
		totalMetrics.item(1).innerHTML = `${availableSlots} of 2500`;
	})
	obtainer.send();
}

function checkWallet() {
	/*Verifica si la wallet pasada por el usuario se encuentra dentro de la
	base de datos. En caso positivo le enseña un mensaje en donde le indica
	su nivel de donador y la cantidad donada, en caso negativo le enseña un
	mensaje indicándole que no ha realizado ninguna transacción a la
	billetera de donaciones, y le provee un link a nuestro canal de tikets
	de discord en caso de que se trate de un error.*/
	console.log("cheking if wallet is in the whitelist...");
	const wallet = document.querySelector(".wallet-input").value;
	var donation;
	var message = {
		"true":document.getElementById("transaction-true"),
		"false":document.getElementById("transaction-false")
	}
	const obtainer = new XMLHttpRequest();
	obtainer.open("GET", tinyapi, true);
	obtainer.addEventListener("load", () => {
		const transactions = JSON.parse(obtainer.response).result;
		for (let i = transactions.length - 1; i >= 0; i--) {
			if (wallet == transactions[i][0]) {
				donation = transactions[i][2];
				break;
			}
		}
		if (donation != undefined) {
			if (message["false"].style.display == "block") {
				message["false"].style.display = "";
			}
			var tier;
			if (donation >= 220) {
				tier = "3";
			} else if (donation >= 110) {
				tier = "2";
			} else if (donation >= 40) {
				tier = "1";
			} else {
				tier = "0";
			}
			message["true"].innerHTML = `
				You have donated!
				<br>
				You are registered in the whitelist
				with a donation of ${donation} BUSD
				making you a tier ${tier} donator.
			`
			message["true"].style.display = "block";
		} else {
			if (message["true"].style.display == "block") {
				message["true"].style.display = "";
			}
			message["false"].style.display = "block";
		}
	})
	obtainer.send()
	
}

async function submitTxhash() {
	/*Recibe un hash de transación dado por el usuario y comprueba que esta
	sea válida y que haya realizado una donación a nuestra billetera de
	donaciones, en caso de cumplir todas las condiciones el hash es
	registrado en la base de datos junto con la dirección de la billetera
	del donador y la cantidad donada.*/
	console.log("Uploading txhash to the database...");
	const txhash = document.querySelector(".txHash-input").value;
	document.querySelector(".txHash-input").value = "";
	try {
		var transaction = await bscweb3.eth.getTransactionReceipt(txhash);
		if (transaction == null) {
			alert("Error: Transaction not found");
		} else if (transaction.to != "0x75c76A207020E2b20ba7e97225f1483C46E2430b") {
			alert("Error: The money was send to the wrong address");
		} else if (transaction.status == false) {
			alert("Error: Submmited transaction has a failed status");
		} else {
			transaction = await bscweb3.eth.getTransaction(txhash);
			const donatedBusd = Math.round(transaction.value * 1E-18 / 0.002158);
			const inserter = new XMLHttpRequest();
			inserter.open("POST", tinyapi, true);
			inserter.setRequestHeader("Content-type", "text/plain");
			inserter.addEventListener("load", () => {
				let response = JSON.parse(inserter.response);
				if (response.result == "inserted") {
					updateAvailableSlots();
					updateBalance();
					alert(`
						Transaction: ${txhash}
						\nhas been successfully added to our database
					`);
				} else {
					updateBalance();
					alert(`
						New transaction from: ${transaction.from}
						\nhas been successfully added to our database
					`);
				}
			})
			inserter.addEventListener("error", (err) => {
				console.log(err);
				alert("Error: TxHash already registered");
			})
			inserter.send(JSON.stringify({
				"address":transaction.from,
				"txhash":txhash,
				"busd":donatedBusd
			}));
		}
	} catch(err) {
		console.log(err);
		alert("Error: Invalid TxHash");
	}
}

function startVerifier() {
	/*Inicia la verificación periódica de los espacios de donación
	disponibles y del balance actual en BUSD de la billetera de
	donaciones*/
	var updater = setInterval(function() {
		updateAvailableSlots();
		updateBalance();
	}, 40000);
}

//Instrucciones a ejecutar cuando se carga la página:
window.addEventListener("load", function() {
	console.log("Running API: " + tinyapi)
    updateBalance()
	updateAvailableSlots();
	startVerifier();
});

document.querySelector(".submit-wallet").addEventListener("click", () => {checkWallet()});
document.querySelector(".submit-txhash").addEventListener("click", () => {submitTxhash()});

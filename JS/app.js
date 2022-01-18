const totalMetrics = document.getElementsByClassName("number-total-metrics");
const bscweb3 = new Web3("https://bsc-dataseed1.binance.org:443");

// Comprobar código
function updateBalance() {
    console.log("Getting wallet balance...");
	let bscApi = "https://api.bscscan.com/api"
				+"?module=account"
				+"&action=tokenbalance"
				+"&contractaddress=0xe9e7cea3dedca5984780bafc599bd69add087d56"
				+"&address=0x75c76A207020E2b20ba7e97225f1483C46E2430b"
				+"&tag=lastest"
				+"&apikey=CWZ5AVKC4FVWNNRJQXENIPIU457W8TR6SK"
	const obtainer = new XMLHttpRequest();
	obtainer.open("GET", bscApi, true);
	obtainer.addEventListener("load", () => {
		let result = parseInt(JSON.parse(obtainer.response).result) * 1E-18;
		totalMetrics.item(0).innerHTML = `${result}` + " of 50.000";

	})
	obtainer.send();
}

// Comprobar código
function updateAvailableSlots(availableSlots) {
	console.log("Updating slots...");
	if (availableSlots == undefined) {
		const obtainer = new XMLHttpRequest();
		obtainer.open("GET", "https://tinyapi-online.herokuapp.com/", true);
		obtainer.addEventListener("load", () => {
			availableSlots = 2500 - JSON.parse(obtainer.response).result.length;
			totalMetrics.item(1).innerHTML = `${availableSlots} of 2500`;
		})
		obtainer.send();
	} else {
		totalMetrics.item(1).innerHTML = `${availableSlots} of 2500`;
	}
}

// Comprobar código
function checkWallet() {
	console.log("cheking the wallet in the whitelist...");
	const wallet = document.querySelector(".wallet-input").value;
	var isWhitelisted = false;
	var transactionTrue = document.getElementById("transaction-true");
	var transactionFalse = document.getElementById("transaction-false");
	const obtainer = new XMLHttpRequest();
	obtainer.open("GET", "https://tinyapi-online.herokuapp.com/", true);
	obtainer.addEventListener("load", (data) => {
		const transactions = JSON.parse(obtainer.response).result;
		console.log(transactions);
		for (let i = transactions.length - 1; i >= 0; i--) {
			if (wallet == transactions[i][0]) {
				isWhitelisted = true;
			}
		}
		if (isWhitelisted == true) {
			if (transactionFalse.style.display == "block") {
				transactionFalse.style.display = "";
			}
			document.getElementById("transaction-true").style.display = "block";
		} else {
			if (transactionTrue.style.display == "block") {
				transactionTrue.style.display = "";
			}
			document.getElementById("transaction-false").style.display = "block";
		}
	})
	obtainer.send()
	
}

/*TODO:
- Hacer que el comprobador verifique la address to:
- Hacer que actualize la database en caso de repetición de address
- Hacer que pueda borrar entradas de la base de datos.
*/
async function submitTxhash() {
	console.log("Uploading txhash to the database...");
	const txhash = document.querySelector(".txHash-input").value;
	try {
		var transaction = await bscweb3.eth.getTransactionReceipt(txhash);
		if (transaction == null) {
			alert("Error: Transaction not found")
		} else {
			console.log(transaction);
			const inserter = new XMLHttpRequest();
			inserter.open("POST", "https://tinyapi-online.herokuapp.com/", true);
			inserter.setRequestHeader("Content-type", "text/plain");
			inserter.addEventListener("load", (data) => {
				console.log(inserter.response);
				updateAvailableSlots();
				updateBalance();
				alert(`TxHash: ${txhash} successfully saved in our database`);
			})
			inserter.addEventListener("error", (err) => {
				console.log(err);
				alert("Error: TxHash already registered");
			})
		inserter.send(JSON.stringify({"address":transaction.from,"txhash":txhash}));
		}
	} catch(err) {
		console.log(err);
		alert("Error: Invalid TxHash");
	}
}

function startVerifier() {
	var updater = setInterval(function() {
		updateAvailableSlots();
		updateBalance();
	}, 40000);
}

window.addEventListener("load", function() {
    updateBalance()
	updateAvailableSlots();
	startVerifier();
});

document.querySelector(".submit-wallet").addEventListener("click", () => {checkWallet()});
document.querySelector(".submit-txhash").addEventListener("click", () => {submitTxhash()});
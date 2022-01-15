const totalMetrics = document.getElementsByClassName("number-total-metrics");

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

/*TODO:
- Arreglar el condicional dentro del comparador.
- Utiliar el API de Binance (o web3) para comparar los senders dentro de los TxHash.
- Recuerda agregar "transaction-false" y "transaction-true" al comparador.
*/
function getTransactions() {
	const wallet = document.querySelector(".wallet-input").value;
	console.log("Submmited wallet: " + wallet);
    const connection = new XMLHttpRequest();
	connection.open("GET", "./transactions.sqlite", true);
	connection.responseType = "arraybuffer";
	connection.addEventListener("load", () => {
		const uint8 = new Uint8Array(connection.response);
		initSqlJs()
		.then((sql) => {
			const database = new sql.Database(uint8);
			const transactions = database.exec("SELECT * FROM test")[0].values;
			for (let i = transactions.length - 1; i >= 0; i--) {
				if (wallet == transactions[i][1]) {
					console.log("Success");
					break;
				} else {
					console.log("Not matches");
				}
			}
			console.log(transactions);
			database.close();
		})
	})
	connection.send();
}

/*TODO:
- Crear la función que añade gente a la database.
*/
function testme() {
	console.log("Not done");
}

var balReqId = setInterval(function() {
    getBalance()
    .then((result) => {
        totalMetrics.item(0).innerHTML = `${result}` + " of 50.000";
    })    
}, 35000);


window.addEventListener("load", function() {
    getBalance()
    .then((result) => {
        totalMetrics.item(0).innerHTML = `${result}` + " of 50.000";
    })
    totalMetrics.item(1).innerHTML = "2500 of 2500";
});

document.querySelector(".submit-wallet").addEventListener("click", () => {getTransactions()});
document.querySelector(".submit-txhash").addEventListener("click", () => {testme()});
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
    totalMetrics.item(1).innerHTML = "0 of 2500";
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
        var userAccount = web3.eth.accounts[0];
        console.log("Account detected" + userAccount)
    } else {
        alert("Metamask is not installed, please install and reload the page");
    }
});

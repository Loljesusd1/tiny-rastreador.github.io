function startApp() {
    var accountInterval = setInterval(function() {
        if (web3.eth.accounts[0] !== userAccount) {
            alert("Account changed");
        }
    }, 100);
}

window.addEventListener("load", function() {
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
        var userAccount = web3.eth.accounts[0];
        console.log("Account detected" + userAccount)
        startApp();
    } else {
        alert("Metamask is not installed, please install and reload the page");
    }
});

async function getBalance() {
    console.log("Started promise");
    await axios.get(
        "https://api.bscscan.com/api"
        +"?module=account"
        +"&action=balance"
        +"&address=0xCd7CF2f18c41CBc0783B5114a9fAA91aa9eF258c"
        +"&apikey=CWZ5AVKC4FVWNNRJQXENIPIU457W8TR6SK")
    .then(function(data) {
        console.log(data);
        console.log(parseInt(data.data.result) * 1E-18);
    })
    .catch(err=>console.log(err))
}

document.querySelector(".submit-input").addEventListener("click", () => {getBalance()});
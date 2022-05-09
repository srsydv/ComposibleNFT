const cNFTabi = require('./cNFTabi.json');
// const cNFTaddress = '0x4152Fc590604ABA08582198E309140eC9D162b54';
const cNFTaddress = '0xbc537af2Ea776dCEcb21F847f642EAC8eAf6D4C5'
const Web3 = require("web3");
const ERC20Address =  document.getElementById("ERC20Address");
const MTK = '0x08268C6A177Cd529DEAB226829C739C93f463994'
// const MTK = ERC20Address.value
const ERC20ABI = require('./ERC20.json')
let deployedNetworkERC20;
  init = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      console.log("Connected");
    } else {
      alert("Metamask not found");
    }
    cNFTmethods = new web3.eth.Contract(
        cNFTabi,
        cNFTaddress
      );
      // console.log('methods',cNFTmethods)
      const id = await web3.eth.net.getId();
    //   deployedNetworkERC20 = ERC20ABI.networks[id];
      contractERC20 = new web3.eth.Contract(
        ERC20ABI,
        MTK
      );
    
    accounts = await web3.eth.getAccounts();
    console.log("Account",accounts[0]);
  };

  mintNFT = async () => {
    document.getElementById('11').innerHTML = '🔜';
    await cNFTmethods.methods
      .mint(ownerAddress.value)
      .send({ from: accounts[0] })
      .once("receipt", (reciept) => {
        console.log(reciept);
        let data = JSON.stringify(reciept.events.Transfer.returnValues.tokenId);
      document.getElementById('11').innerHTML = data;
    });
    console.log("Minted!!");
  };

  const ownerAddress = document.getElementById("ownerAddress");

const btnMintNFT = document.getElementById("btnCreateItem");
btnMintNFT.onclick = mintNFT;

Approve = async() => {
  document.getElementById('123').innerHTML = 'Processing🔜';
  contractERC20 = new web3.eth.Contract(
    ERC20ABI,
    erc20token.value
  );
await contractERC20.methods
  .approve(cNFTaddress, tokenamount1.value)
  .send({ from: accounts[0] });
console.log("approved");
document.getElementById('123').innerHTML = "Approved👍";
}
const erc20token = document.getElementById("erc20token");
const tokenamount1 = document.getElementById("tokenamount1");
const btnApprove = document.getElementById("btnApprove");
btnApprove.onclick = Approve;

  energizeWithERC20 = async () => {
    document.getElementById('1234').innerHTML = 'Processing🔜';
    const receipt = await cNFTmethods.methods
      .energizeWithERC20(
        accounts[0],
        getTokenId.value,
        ERC20Address.value,
        getTokenAmount.value
      )
      .send({ from: accounts[0] });
    console.log(receipt);
    document.getElementById('1234').innerHTML = "Energized!!✅";
    console.log("Energized!!");
  };
  const getTokenAmount = document.getElementById("getTokenAmount");
  const getTokenId = document.getElementById("getTokenId");
  const btnGetToken = document.getElementById("btnGetToken");
  btnGetToken.onclick = energizeWithERC20;

//   mintERC20 = async () => {
//     const receipt = await contractERC20.methods
//       .mint(ownerAddressERC20.value, tokenAmount.value)
//       .send({ from: accounts[0] });
//     console.log(receipt);
//     console.log("Minted!!");
//   };
//   const btnMintERC20 = document.getElementById("btnCreateERC20");
// btnMintERC20.onclick = mintERC20;


ReleaseERC20 = async () => {
  document.getElementById('process3').innerHTML = 'Processing🔜';
  const receipt = await cNFTmethods.methods
    .transferERC20(
      TokenIdofNFT.value,
      receverAddressofERC20.value,
      Erc20address1.value,
      sendTokenAmount.value
    )
    .send({ from: accounts[0] });
    document.getElementById('process3').innerHTML = 'Released!!✅';
  console.log(receipt);
  console.log("Released!!");
};
Erc20address1 = document.getElementById("Erc20address1");
const receverAddressofERC20 = document.getElementById("receverAddressofERC20");
const sendTokenAmount = document.getElementById("sendTokenAmount");
const TokenIdofNFT = document.getElementById("TokenIdofNFT");

const btnSendToken = document.getElementById("btnSendToken");
btnSendToken.onclick = ReleaseERC20;

  // "0x4c676085933233E3b875De927D7E05212C20c800"
  safeTransferFroms = async() => {
    await cNFTmethods.methods
      .safeTransferFrom(accounts[0],Add.value, tknno.value)
      .send({ from: accounts[0] })
      .once("receipt", (reciept) => {
        console.log(reciept);
        if(reciept){
          document.getElementById('005').innerHTML = 'Transfered!!✅';
        }
    });
  }
  const Add = document.getElementById("Add");
  const tknno = document.getElementById("004");
    const safeTransferFrom1 = document.getElementById("safeTransferFrom");
    safeTransferFrom1.onclick = safeTransferFroms;


    creatorOfs = async() => {
      await cNFTmethods.methods
        . knowCreater(tk1.value)
        .call(
          function(err,res){
            if(res){
              console.log("creater",res)
              document.getElementById('00').innerHTML = res;
            }
          }
        )
    }
    const tk1 = document.getElementById("002");
      const creatorOf1 = document.getElementById("creatorOf");
      creatorOf1.onclick =  creatorOfs;
  
      ownerOfs = async() => {
        await cNFTmethods.methods
          . ownerOf(tk2.value)
          .call(
            function(err,res){
              if(res){
                console.log("Owner",res)
                document.getElementById('001').innerHTML = res;
              }
            }
          )
      }
      const tk2 = document.getElementById("003");
        const ownerOf1 = document.getElementById("ownerOf");
        ownerOf1.onclick =  ownerOfs;


        showBalanceOfNFT = async () => {
          const receipt = await cNFTmethods.methods
            .balanceOfERC20(tid.value,enterAddress.value)
            .call();
            document.getElementById('process4').innerHTML = receipt;
          console.log(receipt);
        };
        const enterAddress = document.getElementById("enterAddress");
        const tid = document.getElementById("tid");
        const btnAccountBalance = document.getElementById("btnAccountBalance");
btnAccountBalance.onclick = showBalanceOfNFT;

  init();
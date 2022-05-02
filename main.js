const cNFTabi = require('./cNFTabi.json');
const cNFTaddress = '0x4152Fc590604ABA08582198E309140eC9D162b54';
const Web3 = require("web3");
const ERC20Address =  document.getElementById("ERC20Address");
const MTK = '0x08268C6A177Cd529DEAB226829C739C93f463994'
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
      const id = await web3.eth.net.getId();
    //   deployedNetworkERC20 = ERC20ABI.networks[id];
      contractERC20 = new web3.eth.Contract(
        ERC20ABI,
        MTK
      );
    
    accounts = await web3.eth.getAccounts();
    console.log('Account',accounts[0])
  };

  mintNFT = async () => {
    await cNFTmethods.methods
      .mint(ownerAddress.value)
      .send({ from: accounts[0] })
      .once("receipt", (reciept) => {
        console.log(reciept);
    });
    console.log("Minted!!");
  };

  const ownerAddress = document.getElementById("ownerAddress");

const btnMintNFT = document.getElementById("btnCreateItem");
btnMintNFT.onclick = mintNFT;

  energizeWithERC20 = async () => {
    contractERC20 = new web3.eth.Contract(
        ERC20ABI,
        ERC20Address.value
      );
    await contractERC20.methods
      .approve(cNFTaddress, getTokenAmount.value)
      .send({ from: accounts[0] });
    console.log("approved");
    const receipt = await cNFTmethods.methods
      .energizeWithERC20(
        accounts[0],
        getTokenId.value,
        ERC20Address.value,
        getTokenAmount.value
      )
      .send({ from: accounts[0] });
    console.log(receipt);
    console.log("Recieved!!");
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
  init();
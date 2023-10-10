import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import Escrow from './Escrow';
const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_arbiter",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_beneficiary",
        "type": "address"
      }
    ],
    "stateMutability": "payable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "Approved",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "arbiter",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "beneficiary",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "depositor",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isApproved",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];


const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, [account]);

  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const value = document.getElementById('wei').value;
    const escrowContract = await deploy(signer, arbiter, beneficiary, ethers.utils.parseEther(value));


    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: value.toString(),
      handleApprove: async () => {
        escrowContract.on('Approved', () => {
          document.getElementById(escrowContract.address).className =
            'complete';
          document.getElementById(escrowContract.address).innerText =
            "✓ It's been approved!";
        });

        await approve(escrowContract, signer);
      },
    };

    setEscrows([...escrows, escrow]);
  }

  async function getEscrowContract() {
    const address = document.getElementById('contract').value;
    // const reg = new RegExp('0x[0-9a-fA-F]{40}');
    // if(address.match(reg)) alert("Invalid Address!");
    const escrowContract = new ethers.Contract(address, abi, provider);
    const [arbiter, beneficiary, balance] = await Promise.all([
      escrowContract.arbiter(),
      escrowContract.beneficiary(),
      provider.getBalance(address),
    ]);
    console.log(arbiter)
    console.log(beneficiary)
    const newEscrow = {
      address: address,
      arbiter,
      beneficiary,
      value: balance.toString(),
      handleApprove: async () => {
        escrowContract.on('Approved', () => {
          document.getElementById(escrowContract.address).className =
            'complete';
          document.getElementById(escrowContract.address).innerText =
            "✓ It's been approved!";
        });

        await approve(escrowContract, signer);
      },
    };
    setEscrows([...escrows, newEscrow]);
    }
    

  return (
    <div id='page'>
    <center><h1>Escrow Creator</h1></center>
    <div id='whole'>
      
      <div className="contract">
        <h2> New Contract </h2>
        <label>
          Arbiter Address
          <input type="text" id="arbiter" />
        </label>

        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" />
        </label>

        <label>
          Deposit Amount (in ETH)
          <input type="text" id="wei" />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
        >
          Deploy
        </div>
      </div>

      <div className="existing-contracts">
        <h2> Existing Contracts </h2>

        <div id="container">
          {escrows.map((escrow) => {
            return <Escrow key={escrow.address} {...escrow} />;
          })}
        </div>
      </div>
      <div className='custom'>
        <h2>Deployed Escrow Contract</h2>
          <label>Enter Contract Adress
          <input type='text' id='contract'></input>
          </label>
          <div
          className="button"
          id="Add"
          onClick={(e) => {
            e.preventDefault();

            getEscrowContract();
          }}
        >
          Search
        </div>
      </div>
    </div>
    <div id='definition'>
      <center><p>A smart contract can play the role of an escrow that holds the fund until the payment conditions are fulfilled. First, specify the settlement procedure and conditions as a smart contract. This smart contract could be specified and deployed by either the seller or buyer. Second, the buyer transfers the token(s)to the escrow smart contract. Third, when token release conditions are met by providing the desired product/server, the respective event is informed to the escrow smart contract. Finally, the escrow validates the pre-defined conditions and releases the tokens to the seller. If the respective event is not informed to the escrow within the stipulated time or the event indicates that the product/service was not delivered as per the agreed terms, then the tokens are sent back to the buyer.</p></center>
    </div>
    </div>
  );
}

export default App;

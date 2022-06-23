import React, { useState, useEffect } from "react";
import axios from "axios";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";

require('dotenv').config();

function App() {
  const [web3, setWeb3] = useState(null);
  const [addrs, setAddrs] = useState([]);
  const [blockNum, setBlockNum] = useState();

  const createWeb3Instance = () => {
    // Read Alchemy api url and api key:
    const apiUrl = process.env.REACT_APP_API_URL;
    const apiKey = process.env.REACT_APP_API_KEY;
    
    // Initialize an alchemy-web3 instance:
    const web3 = createAlchemyWeb3(`${apiUrl}/v2/${apiKey}`);

    setWeb3(web3);
  }

  const getContractMetaData = async (addr) => {
    // Read your Alchemy api key
    const apiKey = process.env.REACT_APP_API_KEY;
    const baseURL = `https://eth-mainnet.alchemyapi.io/nft/v2/${apiKey}/getContractMetadata`;

    // Set configuration for fetch data
    var config = {
      method: 'get',
      url: `${baseURL}?contractAddress=${addr}`,
      headers: { }
    };

    await axios(config)
    .then(response => {
      const result = response.data;
      // Check if it is erc721 contract
      if(result.contractMetadata.tokenType === "erc721") {
        setAddrs([...addrs, result.address]);
        console.log(addrs);
      }
    })
    .catch(error => console.log(error));
  }

  const getERC721ContractAddress = async () => {
    // Get latest block number
    const blockNumber = await web3.eth.getBlockNumber();
    setBlockNum(blockNumber);

    // Get block by block number
    const blockByNumber = await web3.eth.getBlock(0xd2e5f5, true); // For test
    // const blockByNumber = await web3.eth.getBlock('latest', true); 

    // Get transaction hashs of the block
    const txLists = blockByNumber.transactions;
    
    for(let i = 0; i < txLists.length; i++) {
      if(txLists[i].to === null) {
        const txHash = txLists[i].hash;

        // Get transaction receipt
        const txReceipt = await web3.eth.getTransactionReceipt(txHash);
        if(txReceipt.contractAddress !== "") {
          getContractMetaData(txReceipt.contractAddress);
          console.log(txReceipt.contractAddress);
        }
      }
    }
  }

  useEffect(() => {
    if(web3 === null) {
      createWeb3Instance();
    } else {
      getERC721ContractAddress();
    }
  }, [web3]);

  return (
    <div className="App">
      <div>Latest Block Number:{blockNum}</div>
      {addrs 
        &&
        addrs.map((data, idx) => (
          <div key={idx}>{data}</div>
        ))
      }
    </div>
  );
}

export default App;

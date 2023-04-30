/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import ReactLoading from "react-loading";
import "./App.css";
import twitterLogo from "./assets/twitter-logo-2429.svg";
import { ethers } from "ethers";
import MyEpicNft from "./utils/MyEpicNft.json";
import Canvas from "./components/randomNFT";
import axios from "axios";

// Constants
const TWITTER_HANDLE = "JRetnakaran";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = "0x1784Fc450046911EDbeB7D0DcA4ddb18809ad999";
const OPENSEA_LINK = `https://testnets.opensea.io/collection/randomnft-33`;
const TOTAL_MINT_COUNT = 15;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [countMintedNFT, setCountMintedNFT] = useState("0");
  const [loading, setLoading] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  // const [ipfsHash, setIpfsHash] = useState("");
  const [imageData, setImageData] = useState(null);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask");
      return;
    } else {
      console.log("We have ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("found an authorized account:", account);
      setCurrentAccount(account);
      getTotalNFTsMintedSoFar();
      setupEventListener();
    } else {
      console.log("NO authorized account found");
    }
  };
  const checkNetworkChainId = async () => {
    try {
      const { ethereum } = window;

      const chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain " + chainId);

      const mumbaiChainId = "0x13881";
      if (chainId !== mumbaiChainId) {
        alert("You are not connected to the Mumbai Test Network!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get metamask");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      getTotalNFTsMintedSoFar();
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };
  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          MyEpicNft.abi,
          signer
        );

        connectedContract.on("NewEpicNFTMinted", async (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          await getTokenURI(tokenId);
        });
        console.log("Setup event listener");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      // console.log(error);
      alert(error);
    }
  };
  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum && countMintedNFT < TOTAL_MINT_COUNT) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          MyEpicNft.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        // console.log(imageData);
        await sendFileToIPFS(imageData, async (ipfsHash) => {
          console.log("mintnft ipfshash:", ipfsHash);
          let nftTxn = await connectedContract.makeAnEpicNFT(ipfsHash);
          setLoading(true);
          console.log("Mining...please wait.");
          await nftTxn.wait();
          console.log(
            `Mined, see transaction: https://mumbai.polygonscan.com//tx/${nftTxn.hash}`
          );
          setLoading(false);
          setIsMinted(true);
          await getTotalNFTsMintedSoFar();
        });
      } else {
        console.log("Ethereum object doesn't exist or minting limit exceeded");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const sendFileToIPFS = async (imageData, onIpfsHashReady) => {
    console.log("before sending to ipfs:", imageData);
    console.log(imageData.image.data);
    if (imageData && imageData.image && imageData.image.data) {
      try {
        const formData = new FormData();
        formData.append("file", imageData.image.data);
        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: `${process.env.REACT_APP_PINATA_API_KEY}`,
            pinata_secret_api_key: `${process.env.REACT_APP_PINATA_API_SECRET}`,
            "Content-Type": "multipart/form-data",
          },
        });
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
        console.log(resFile.data.IpfsHash);
        // console.log("ipfsHash is :", ImgHash);
        // await setIpfsHash(ImgHash);
        onIpfsHashReady(ImgHash);
        // console.log("after setIpfs:", ipfsHash);
        //Take a look at the Pinata Pinned section, you will see a new file added to you list.
      } catch (error) {
        console.log("Error sending File to IPFS: ");
        console.log(error);
      }
    }
  };
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );
  const getTotalNFTsMintedSoFar = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signers = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          MyEpicNft.abi,
          signers
        );

        const latestTokenId = await connectedContract.totalNFTminted();
        setCountMintedNFT(latestTokenId.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getTokenURI = async (tokenId) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          MyEpicNft.abi,
          provider
        );

        const tokenURI = await contract.tokenURI(tokenId);
        console.log("Token URI:", tokenURI);

        const response = await fetch(tokenURI);
        console.log(response);
        try {
          const metadata = await response.json();
          console.log(metadata);
        } catch (error) {
          console.log(error);
        }

        // console.log("Name:", metadata.name);
        // console.log("Description:", metadata.description);
        // console.log("Image:", metadata.image);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const getTokenURI = () => {
  //   try {
  //     const { ethereum } = window;
  //     if (ethereum) {
  //       const provider = new ethers.providers.Web3Provider(ethereum);
  //       const contract = new ethers.Contract(
  //         CONTRACT_ADDRESS,
  //         MyEpicNft.abi,
  //         provider
  //       );

  //       contract.on("NewEpicNFTMinted", async (sender, tokenId) => {
  //         const logs = await provider.getLogs({
  //           fromBlock: 0,
  //           toBlock: "latest",
  //           address: CONTRACT_ADDRESS,
  //           topics: [contract.interface.getEventTopic("NewEpicNFTMinted")],
  //           filter: {
  //             tokenId: tokenId,
  //           },
  //         });
  //         if (logs.length > 0) {
  //           const log = logs[0];
  //           const { data } = log;
  //           const metadataURI = ethers.utils.defaultAbiCoder.decode(
  //             ["string"],
  //             data
  //           )[0];
  //           const response = await fetch(metadataURI);
  //           const metadata = await response.json();
  //           console.log(metadata.name);
  //           console.log(metadata.description);
  //           console.log(metadata.image);
  //         }
  //       });
  //     } else {
  //     }
  //   } catch (error) {}
  // };
  const getImageData = async (data) => {
    // console.log("Received data from canvas:", data);
    setImageData(data);
    // console.log("Updated imagedata:", imageData);
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    checkNetworkChainId();
    // console.log(imageData);
    // console.log("ipfsHash updated:", ipfsHash);
  });

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <div>
              <Canvas onImageGenerated={getImageData} />
              {imageData && (
                <button
                  onClick={askContractToMintNft}
                  className="cta-button connect-wallet-button"
                >
                  Mint NFT
                </button>
              )}
            </div>
          )}
        </div>
        <div>
          {loading ? (
            <div>
              <p className="sub-text">Minting In Progress.....</p>
              <br />
              <div className="loading-bar">
                <ReactLoading type={"bars"} color={"#ffffff"} />
              </div>
            </div>
          ) : (
            <div>
              {isMinted ? (
                <div className="sub-text">
                  NFT successfully minted.
                  <br />
                  <a
                    href={OPENSEA_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Click to View
                  </a>
                  <br />
                </div>
              ) : (
                ""
              )}
            </div>
            //
          )}
        </div>
        <p className="sub-text gradient-text">
          {countMintedNFT} / {TOTAL_MINT_COUNT} NFTs minted so far. Ready to
          mint more........
        </p>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;

// const renderMintUI = () => (
//   <button
//     onClick={askContractToMintNft}
//     className="cta-button connect-wallet-button"
//   >
//     Mint NFT
//   </button>
// );

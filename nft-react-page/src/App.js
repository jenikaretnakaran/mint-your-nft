import React, { useState, useEffect } from "react";
import ReactLoading from "react-loading";
import "./App.css";
import twitterLogo from "./assets/twitter-logo-2429.svg";
import { ethers } from "ethers";
import MyEpicNft from "./utils/MyEpicNft.json";

// Constants
const TWITTER_HANDLE = "JRetnakaran";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "https://testnets.opensea.io/collection/blacksquarenft-4";
const TOTAL_MINT_COUNT = 15;
const CONTRACT_ADDRESS = "0xfEd26eaaAc4278598aD3f70f6553fE77b6b1bd54";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [countMintedNFT, setCountMintedNFT] = useState("0");
  const [loading, setLoading] = useState(false);
  const [isMinted, setIsMinted] = useState(false);

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

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
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
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setLoading(true);
        console.log("Mining...please wait.");
        await nftTxn.wait();
        console.log(
          `Mined, see transaction: https://mumbai.polygonscan.com//tx/${nftTxn.hash}`
        );
        setLoading(false);
        setIsMinted(true);
        getTotalNFTsMintedSoFar();
      } else {
        console.log("Ethereum object doesn't exist or minting limit exceeded");
      }
    } catch (error) {
      console.log(error);
    }
  };
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button
      onClick={askContractToMintNft}
      className="cta-button connect-wallet-button"
    >
      Mint NFT
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
  useEffect(() => {
    checkIfWalletIsConnected();
    checkNetworkChainId();
  });

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === ""
            ? renderNotConnectedContainer()
            : renderMintUI()}
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
                  NFT successfully minted.<br/>
                  <a href={OPENSEA_LINK} target="_blank" rel="noopener noreferrer">Click to View</a>
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

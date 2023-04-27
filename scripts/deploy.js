const main = async () => {
    /*
    *This will actually compile the contract and generate the necessary files that need to work with the contract under the artifacts directory
    */
    const nftContractFactory = await hre.ethers.getContractFactory('MyEpicNFT');
    /*
    * Hardhat will create a local Ethereum network for us, but just for this contract. Then, after the script completes it'll destroy that local network
    */
    const nftContract = await nftContractFactory.deploy();
    await nftContract.deployed();
    console.log("Contract deployed to :" ,nftContract.address);

    // //call the function.
    // let txn =  await nftContract.makeAnEpicNFT();
    // //wait for it to mined
    // await txn.wait();
    // console.log("MINTED NFT #1")

    //mint another NFT for fun
    // txn = await nftContract.makeAnEpicNFT();
    // await txn.wait();
    // console.log("MINTED NFT #2")
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    }
    catch(error) {
        console.log(error);
        process.exit(1);
    }
}
runMain();
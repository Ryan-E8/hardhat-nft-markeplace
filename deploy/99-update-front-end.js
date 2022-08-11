// const {
//     frontEndContractsFile,
//     frontEndContractsFile2,
//     frontEndAbiLocation,
//     frontEndAbiLocation2,
// } = require("../helper-hardhat-config")
// require("dotenv").config()
const fs = require("fs")
const { ethers, network } = require("hardhat")

const frontEndContractsFile = "../nextjs-nft-marketplace/constants/networkMapping.json"
// This way it'll override the abi file any time we send it
const frontEndAbiLocation = "../nextjs-nft-marketplace/constants/"

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    fs.writeFileSync(
        `${frontEndAbiLocation}NftMarketplace.json`,
        nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
    )
    const basicNft = await ethers.getContract("BasicNft")
    fs.writeFileSync(
        `${frontEndAbiLocation}BasicNft.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json)
    )
}

async function updateContractAddresses() {
    const chainId = network.config.chainId.toString()
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    // Read contractAddresses in the file that are already there
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    // If the contractAddress does not exist in the file, then update it, else add it
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.address)) {
            contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.address)
        }
    } else {
        // Make a new entry of NftMarketplace
        contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] }
    }
    // Now write it back
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "frontend"]

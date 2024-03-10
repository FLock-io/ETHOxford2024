import { ethers } from "hardhat";
import ETHBridge from "../artifacts/contracts/ETHBridge.sol/ETHBridge.json";
import FLRBridge from "../artifacts/contracts/FLRBridge.sol/FLRBridge.json";

const ETH_BRIDGE_ADDRESS = "0xBA81FB1FddB2c281A617129842B7B9cA09217ae3";
const FLR_BRIDGE_ADDRESS = "";

async function main() {
    console.log("Initiating...");

    const ethprovider = new ethers.providers.JsonRpcProvider(
        'https://sepolia-rpc.scroll.io/'
      );

    const deployer = new ethers.Wallet(
        process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY : "",
        ethprovider
    );


}

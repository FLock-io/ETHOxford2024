import { ethers } from "hardhat";
import FLRBridge from "../artifacts/contracts/FLRBridge.sol/FLRBridge.json";
import * as dotenv from "dotenv";

dotenv.config();

const FLBRIDGE_CONTRACT_ADDRESS = "0xccB0f0a5783643C81AD77C8c3C203cA344A7Ad7E"; 

async function main() {
    console.log("Starting the bridge listener...");

    const ethprovider = new ethers.JsonRpcProvider(
        'https://sepolia-rpc.scroll.io/'
      );
    const deployer = new ethers.Wallet(
        process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY : "",
        ethprovider
    );

    const bridgeContract = new ethers.Contract(
        FLBRIDGE_CONTRACT_ADDRESS,
        FLRBridge.abi,
        deployer 
    );

    console.log("Listening for ReceiveWETH events...");

    bridgeContract.on("ReceiveWETH", async (sender, value) => {
        console.log(`ReceiveWETH event detected from ${sender} for ${(value)} WETH`);

        // Call the releaseFLR function upon catching the event
        try {
            console.log(`Attempting to release FLR to ${sender}...`);
            const tx = await bridgeContract.releaseFLR(sender, value, {
                gasLimit: 1000000, // Set an appropriate gas limit
            });
            const receipt = await tx.wait();
            console.log(`FLR released successfully. Transaction Hash: ${receipt.transactionHash}`);
        } catch (error: any) {
            console.error(`Failed to release FLR: ${error.message}`);
        }
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

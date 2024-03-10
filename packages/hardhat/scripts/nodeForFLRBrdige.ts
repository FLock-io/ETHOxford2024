import { ethers } from "hardhat";
import FLRBridge from "../artifacts/contracts/FLRBridge.sol/FLRBridge.json";
import * as dotenv from "dotenv";

dotenv.config();

const FLR_BRIDGE_CONTRACT_ADDRESS = "0xBA81FB1FddB2c281A617129842B7B9cA09217ae3"; 

async function main() {
    console.log("Starting the bridge listener...");

    const fLRprovider = new ethers.JsonRpcProvider(
        'https://coston-api.flare.network/ext/C/rpc	'
      );
    const deployer = new ethers.Wallet(
        process.env.DEPLOYER_PRIVATE_KEY ? process.env.DEPLOYER_PRIVATE_KEY : "",
        fLRprovider
    );

    const bridgeContract = new ethers.Contract(
        FLR_BRIDGE_CONTRACT_ADDRESS,
        FLRBridge.abi,
        deployer 
    );

    console.log("Listening for ReceiveFLR events...");

    bridgeContract.on("ReceiveFLR", async (sender, value) => {
        console.log(`ReceiveFLR event detected from ${sender} for ${(value)} FLR`);

        // Call the releaseFLR function upon catching the event
        try {
            console.log(`Attempting to release WETH to ${sender}...`);
            const tx = await bridgeContract.releaseWETH(sender, value, {
                gasLimit: 1000000, // Set an appropriate gas limit
            });
            const receipt = await tx.wait();
            console.log(`WETH released successfully. Transaction Hash: ${receipt.transactionHash}`);
        } catch (error: any) {
            console.error(`Failed to release WETH: ${error.message}`);
        }
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

import { ethers } from "hardhat";
import FLRBridge from "../artifacts/contracts/FLRBridge.sol/FLRBridge.json";
import ETHBridge from "../artifacts/contracts/ETHBridge.sol/ETHBridge.json";
import * as dotenv from "dotenv";

dotenv.config();

const FLR_BRIDGE_CONTRACT_ADDRESS = "0x07962C28579b1e76f3d39E860a077aA40aFe851C"; 
const ETH_BRIDGE_CONTRACT_ADDRESS = "0xD92A717bf82CF506Af981230636e88dBdd2a1347";

async function main() {
    console.log("Starting the bridge listener...");

    const fLRprovider = new ethers.JsonRpcProvider(
        'https://coston-api.flare.network/ext/C/rpc	'
      );
    const deployer = new ethers.Wallet(
        process.env.DEPLOYER_PRIVATE_KEY ? process.env.DEPLOYER_PRIVATE_KEY : "",
        fLRprovider
    );

    const FLR_BridgeContract = new ethers.Contract(
        FLR_BRIDGE_CONTRACT_ADDRESS,
        FLRBridge.abi,
        deployer 
    );

    const ETH_BridgeContract = new ethers.Contract(
        ETH_BRIDGE_CONTRACT_ADDRESS,
        ETHBridge.abi,
        deployer 
    );

    console.log("Listening for ReceiveFLR events...");

    FLR_BridgeContract.on("ReceiveFLR", async (sender, value) => {
        console.log(`ReceiveFLR event detected from ${sender} for ${(value)} FLR`);

        // Call the releaseFLR function upon catching the event
        try {
            console.log(`Attempting to release WFLR to ${sender}...`);
            const tx = await ETH_BridgeContract.releaseWFLR(sender, value, {
                gasLimit: 1000000, // Set an appropriate gas limit
            });
            const receipt = await tx.wait();
            console.log(`WFLR released successfully. Receipt Hash: ${receipt}`);
        } catch (error: any) {
            console.error(`Failed to release WFLR: ${error.message}`);
        }
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

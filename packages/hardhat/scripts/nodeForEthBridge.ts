import { ethers } from "hardhat";
import FLRBridge from "../artifacts/contracts/FLRBridge.sol/FLRBridge.json";
import ETHBridge from "../artifacts/contracts/ETHBridge.sol/ETHBridge.json";
import * as dotenv from "dotenv";

dotenv.config();

const FLR_BRIDGE_CONTRACT_ADDRESS = "0x07962C28579b1e76f3d39E860a077aA40aFe851C"; 
const ETH_BRIDGE_CONTRACT_ADDRESS = "0xD92A717bf82CF506Af981230636e88dBdd2a1347";
const providerApiKey = process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

async function main() {
    console.log("Starting the bridge listener...");

    const fLRprovider = new ethers.JsonRpcProvider(
        'https://coston-api.flare.network/ext/C/rpc'
      );

    const fLR_deployer = new ethers.Wallet(
        process.env.DEPLOYER_PRIVATE_KEY ? process.env.DEPLOYER_PRIVATE_KEY : "",
        fLRprovider
    );

    const ETHProvider = new ethers.JsonRpcProvider(
        `https://eth-sepolia.g.alchemy.com/v2/X1EpVDbiokKqFoMnR4_J9DToaCjjJy3E`
    );

    const ETHDeployer = new ethers.Wallet(
        process.env.DEPLOYER_PRIVATE_KEY ? process.env.DEPLOYER_PRIVATE_KEY : "",
        ETHProvider
    );

    const FLR_BridgeContract = new ethers.Contract(
        FLR_BRIDGE_CONTRACT_ADDRESS,
        FLRBridge.abi,
        fLR_deployer 
    );

    const ETH_BridgeContract = new ethers.Contract(
        ETH_BRIDGE_CONTRACT_ADDRESS,
        ETHBridge.abi,
        ETHDeployer 
    );

    console.log("Listening for ReceiveFLR events...");

    ETH_BridgeContract.on("ReceiveETH", async (sender, value) => {
        console.log(`ReceiveETH event detected from ${sender} for ${(value)} ETH`);

        // Call the releaseFLR function upon catching the event
        try {
            console.log(`Attempting to release WETH to ${sender}...`);
            const tx = await FLR_BridgeContract.releaseWETH(sender, value, {
                gasLimit: 1000000, // Set an appropriate gas limit
            });
            const receipt = await tx.wait();
            console.log(`WETH released successfully`);  
            console.log(receipt.hash);

        } catch (error: any) {
            console.error(`Failed to release WETH: ${error.message}`);
        }
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

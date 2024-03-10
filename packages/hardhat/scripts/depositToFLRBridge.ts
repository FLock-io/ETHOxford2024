import { ethers } from "hardhat";
import * as dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function main() {
    const deployer = (await ethers.getSigners())[0];
    const fLRBridge = (await ethers.getContractFactory("FLRBridge")).attach("0x07962C28579b1e76f3d39E860a077aA40aFe851C");

    // Correctly parse the amount of ether to send
    const amount = BigInt("1000000000000000");
    const fee = BigInt("100000000000000");
    const total = amount + fee;
    console.log(`Depositing ${amount} FLR to the bridge...`)
    
    const tx = await fLRBridge.connect(deployer).bridgeFLR(amount, fee, {
        value: total, // Pass the BigNumber directly for the transaction value
    });
    const receipt = await tx.wait();
    console.log(receipt.hash);
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

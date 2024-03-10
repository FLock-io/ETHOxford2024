import { ethers } from "hardhat";
import * as dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function main() {
    const deployer = (await ethers.getSigners())[0];
    const ethBridge = (await ethers.getContractFactory("ETHBridge")).attach("0xD92A717bf82CF506Af981230636e88dBdd2a1347");

    // Correctly parse the amount of ether to send
    const amount = BigInt("1000000000000000");
    const fee = BigInt("100000000000000");
    const total = amount + fee;
    console.log(`Depositing ${amount} ETH to the bridge...`)
    
    const tx = await ethBridge.connect(deployer).bridgeETH(amount, fee, {
        value: total, // Pass the BigNumber directly for the transaction value
    });
    const receipt = await tx.wait();
    console.log(receipt.hash);
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

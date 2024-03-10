import { ethers } from "hardhat";
import * as dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function main() {
    const deployer = (await ethers.getSigners())[0];
    const wrappedFlare = (await ethers.getContractFactory("ERC20Token")).attach("0xc5618D6509344EED2d7e65269EeE488c13474032")
    const bridgeToken = (await ethers.getContractFactory("ERC20Token")).attach("0xccB0f0a5783643C81AD77C8c3C203cA344A7Ad7E")

    await wrappedFlare.connect(deployer).addMinter("0x4ff7186D1a23589E2Bd07c97615E4A3021A7609C");
    const tx = await bridgeToken.connect(deployer).addMinter("0x4ff7186D1a23589E2Bd07c97615E4A3021A7609C");
    const receipt = await tx.wait();
    console.log(receipt);
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

import { expect } from "chai";
import { ethers, HardhatEthersSigner } from "hardhat";
import { YourContract, ERC20Token, ETHBridge } from "../typechain-types";

describe("ETHBridge", function () {
  // We define a fixture to reuse the same setup in every test.

  let wrappedFlare: ERC20Token;
  let bridgeToken: ERC20Token;
  let ethBridge: ETHBridge;

  let owner: HardhatEthersSigner,
    event_listener: HardhatEthersSigner,
    user1: HardhatEthersSigner,
    user2: HardhatEthersSigner;

  before(async () => {
    [owner, event_listener, user1, user2] = await ethers.getSigners();
    console.log("Deploy wFLR")
    const wrappedFlareFactory = await ethers.getContractFactory("ERC20Token");
    wrappedFlare = (await wrappedFlareFactory.deploy(owner.address, "Wrapped FLR", "wFLR")) as ERC20Token;
    await wrappedFlare.waitForDeployment()
    console.log("Deploy BRT")
    const bridgeTokenFactory = await ethers.getContractFactory("ERC20Token");
    bridgeToken = (await bridgeTokenFactory.deploy(owner.address, "Bridge Token", "BRT")) as ERC20Token;
    await bridgeToken.waitForDeployment()

    const ETHBridgeFactory = await ethers.getContractFactory("ETHBridge");
    ethBridge = (await ETHBridgeFactory.deploy(event_listener.address, await wrappedFlare.getAddress(), await bridgeToken.getAddress())) as ETHBridge;
    await ethBridge.waitForDeployment()

    await wrappedFlare.addMinter(event_listener.address)
    await bridgeToken.addMinter(event_listener.address)
    await wrappedFlare.addMinter(await ethBridge.getAddress())
    await bridgeToken.addMinter(await ethBridge.getAddress())
  });

  describe("Test contract", function () {
    it("Should deposit and release ETH", async function () {
        // User balance before 
        await ethBridge.connect(user1).bridgeETH(BigInt(10**18), BigInt(10**16), {value: BigInt(10**18+10**16)})
        // Balance of the contract should be 1
        expect(await ethers.provider.getBalance(await ethBridge.getAddress())).to.equal(BigInt(10**18+10**16))

        const tx = await ethBridge.connect(event_listener).releaseETH(user1.address, BigInt(10**18))
        const receipt = await tx.wait()
        console.log("Gas used for releaseETH", receipt?.gasUsed.toString())
        // Balance of the contract should be 0
        expect(await ethers.provider.getBalance(await ethBridge.getAddress())).to.equal(BigInt(10**16))
    })

    it("Should deposit and release wFLR", async function () {
        // User balance before 
        const tx = await ethBridge.connect(event_listener).releaseWFLR(user1.address, BigInt(10**18))
        const receipt = await tx.wait()
        console.log("Gas used for releaseWFLR", receipt?.gasUsed.toString())

        // Balance of the contract should be 0
        expect(await wrappedFlare.balanceOf(user1.address)).to.equal(BigInt(10**18))

        await wrappedFlare.connect(user1).approve(await ethBridge.getAddress(), BigInt(10**18))

        await ethBridge.connect(user1).bridgeWFLR(BigInt(10**18), BigInt(10**16), {value: BigInt(10**16)})
    
        // Balance of the contract should be 0
        expect(await wrappedFlare.balanceOf(user1.address)).to.equal(0)
    })
  });
});

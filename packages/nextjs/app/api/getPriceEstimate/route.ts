import { NextRequest, NextResponse } from "next/server";
import * as flare from "@flarenetwork/flare-periphery-contract-artifacts";
import { ethers } from "ethers";

const NATIVE_TRANSFER_GAS = 36000;
const ERC20_TRANSFER_GAS = 80000;

const GAS_PRICE_ETH = 10 ** 9;
const GAS_PRICE_FLR = 63 * 10 ** 9;

const FLARE_RPC = "https://flare-api.flare.network/ext/bc/C/rpc";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const chain = url.searchParams.get("chain") || "ETH";
  const tokenType = url.searchParams.get("tokenType") || "NATIVE";
  try {
    const ethPrice = await runGettingDataFeeds("ETH");
    const flrPrice = await runGettingDataFeeds("FLR");
    const result = calculateGasFee(flrPrice, ethPrice, chain, tokenType);

    return NextResponse.json({ gasFee: result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error with price oracle" }, { status: 500 });
  }
}

const calculateGasFee = (flrPrice: number, ethPrice: number, originChain: string, tokenType: string) => {
  if (originChain === "ETH") {
    return (GAS_PRICE_FLR * (tokenType === "NATIVE" ? NATIVE_TRANSFER_GAS : ERC20_TRANSFER_GAS) * flrPrice) / ethPrice;
  } else {
    return (GAS_PRICE_ETH * (tokenType === "NATIVE" ? NATIVE_TRANSFER_GAS : ERC20_TRANSFER_GAS) * ethPrice) / flrPrice;
  }
};

async function runGettingDataFeeds(_symbol: string) {
  console.log(`Retrieving current price of ${_symbol}...`);

  // Node to submit queries to.
  const provider = new ethers.JsonRpcProvider(FLARE_RPC);

  // 2. Access the Contract Registry
  const flareContractRegistry = new ethers.Contract(
    "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019",
    flare.nameToAbi("FlareContractRegistry", "flare").data,
    provider,
  );

  // 3. Retrieve the FTSO Registry
  const ftsoRegistryAddr = await flareContractRegistry.getContractAddressByName("FtsoRegistry");

  const ftsoRegistry = new ethers.Contract(ftsoRegistryAddr, flare.nameToAbi("FtsoRegistry", "flare").data, provider);

  // 4. Get latest price
  const [_price, _timestamp, _decimals] = await ftsoRegistry["getCurrentPriceWithDecimals(string)"](_symbol);

  const price = Number(_price) / Math.pow(10, Number(_decimals));
  console.log(`${price} USD`);
  console.log(`Calculated at ${new Date(Number(_timestamp) * 1000)}`);
  return price;
}

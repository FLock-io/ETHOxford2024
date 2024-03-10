"use client";

import { useEffect, useState } from "react";
import { time } from "console";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { set } from "nprogress";
import { formatUnits, parseEther } from "viem";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import { ERC20TOKEN_ABI } from "~~/contracts/ERC20Token";
import { ETHBRIDGE_ABI } from "~~/contracts/ETHBridge";
import { FLRBRIDGE_ABI } from "~~/contracts/FLRBridge";

type Token = {
  symbol: string;
  icon: string;
};

const tokens: Token[] = [
  {
    symbol: "ETH",
    icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
  },
  {
    symbol: "FLR",
    icon: "https://assets.coingecko.com/coins/images/28624/standard/FLR-icon200x200.png?1696527609",
  },
  {
    symbol: "BRT",
    icon: "https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400",
  },
];

const ETHBRIDGE_ADDRESS = "0xD92A717bf82CF506Af981230636e88dBdd2a1347";
const FLRBRIDGE_ADDRESS = "0x07962C28579b1e76f3d39E860a077aA40aFe851C";

const WFLR_ADDRESS = "0xf4b66326E763a6adB4784A1B77274B1a07fdBFA5";
const ETHBRT_ADDRESS = "0x0DEE99044ACBa96d20e799C6757473a6dAca1eA4";

const WETH_ADDRESS = "0xb1050CDEB09bF6A221B4f142D01379eB9C79738F";
const FLRBRT = "0x0f5e5FF59E5845b16C9948CE01E449e84668FB27";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [currentToken, setCurrentToken] = useState(tokens.find(token => token.symbol === "ETH") as Token);
  const [fromChain, setFromChain] = useState(0);
  const [amountToSend, setAmountToSend] = useState(0);
  const [gasFees, setGasFees] = useState(0);
  const [loadingGasFees, setLoadingGasFees] = useState(false);
  const [txLoading, setTxLoading] = useState(false);

  const sepoliaProvider = new ethers.JsonRpcProvider(
    "https://eth-sepolia.g.alchemy.com/v2/oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",
  );
  const flareProvider = new ethers.JsonRpcProvider("https://coston-api.flare.network/ext/C/rpc");

  const checkAllowance = async () => {
    if (!connectedAddress) return;
    // console.log(await flareProvider._network);
    // console.log(sepoliaProvider);

    // let signer;
    // if (fromChain) {
    //   signer = await flareProvider.getSigner();
    // } else {
    //   signer = await sepoliaProvider.getSigner();
    // }

    // const contract = new ethers.Contract(
    //   currentToken.symbol === "BRT"
    //     ? "0xccB0f0a5783643C81AD77C8c3C203cA344A7Ad7E"
    //     : "0xc5618D6509344EED2d7e65269EeE488c13474032",
    //   ERC20TOKEN_ABI,
    //   signer,
    // );

    // try {
    //   const tx = await contract.allowance(fromChain ? FLRBRIDGE_ADDRESS : ETHBRIDGE_ADDRESS, connectedAddress);
    //   console.log(tx);
    //   console.log("Allowance:", formatUnits(tx, 18));
    // } catch (error) {
    //   console.error("Error: ", error);
    // }
  };

  // const { data } = useContractRead({
  //   address: currentToken.symbol === "BRT" ? ETHBRT_ADDRESS : WETH_ADDRESS,
  //   abi: ERC20TOKEN_ABI,
  //   functionName: "allowance",
  //   args: [fromChain ? FLRBRIDGE_ADDRESS : ETHBRIDGE_ADDRESS, connectedAddress],
  // });

  // const approveTokens = async () => {
  //   if (!connectedAddress) return;

  //   const contract = new ethers.Contract(
  //     currentToken.symbol === "BRT"
  //       ? "0xccB0f0a5783643C81AD77C8c3C203cA344A7Ad7E"
  //       : "0xc5618D6509344EED2d7e65269EeE488c13474032",
  //     ERC20TOKEN_ABI,
  //     signer,
  //   );

  //   try {
  //     const tx = await contract.approve(
  //       fromChain ? FLRBRIDGE_ADDRESS : ETHBRIDGE_ADDRESS,
  //       parseEther(amountToSend.toString()),
  //     );
  //     console.log(tx);
  //     console.log("Allowance:", formatUnits(tx, 18));
  //   } catch (error) {
  //     console.error("Error: ", error);
  //   }
  // };

  const {
    data: dataETH,
    isLoading: isLoadingETH,
    isSuccess: isSuccessETH,
    write: sendETHToETHBridge,
  } = useContractWrite({
    address: ETHBRIDGE_ADDRESS,
    abi: ETHBRIDGE_ABI,
    functionName: "bridgeETH",
  });

  const {
    data: dataFLR,
    isLoading: isLoadingFLR,
    isSuccess: isSuccessFLR,
    write: sendFLRToFLRBridge,
  } = useContractWrite({
    address: FLRBRIDGE_ADDRESS,
    abi: FLRBRIDGE_ABI,
    functionName: "bridgeFLR",
  });

  const sendTokensOnFLR = async () => {
    if (!connectedAddress) return;

    setTxLoading(true);

    sendETHToETHBridge({
      args: [parseEther(amountToSend.toString()), parseEther(gasFees.toString())],
      value: parseEther((amountToSend + gasFees).toString()),
    });

    setTimeout(() => {
      setTxLoading(false);
    }, 5000);
  };

  const sendTokensOnETH = async () => {
    if (!connectedAddress) return;

    setTxLoading(true);

    sendETHToETHBridge({
      args: [parseEther(amountToSend.toString()), parseEther("0.001")],
      value: parseEther((amountToSend + 0.001).toString()),
    });

    setTimeout(() => {
      setTxLoading(false);
    }, 5000);

    // const contract = new ethers.Contract(fromChain ? FLRBRIDGE_ADDRESS : ETHBRIDGE_ADDRESS, ETHBRIDGE_ABI, signer);

    // try {
    //   let tx;
    //   if (currentToken.symbol === "BRT") {
    //     tx = await contract.bridgeERC(parseEther(amountToSend.toString()), parseEther(gasFees.toString()));
    //   } else if (currentToken.symbol === "ETH") {
    //     tx = await contract.bridgeWETH(parseEther(amountToSend.toString()), parseEther(gasFees.toString()));
    //   } else {
    //     tx = await contract.bridgeFLR(parseEther(amountToSend.toString()), parseEther(gasFees.toString()));
    //   }

    //   await tx.wait();
    //   console.log(tx);
    // } catch (error) {
    //   console.error("Error: ", error);
    // }
  };

  // const sendTokensOnFLR = async () => {
  //   if (!connectedAddress || gasFees || amountToSend) return;

  //   const contract = new ethers.Contract(fromChain ? FLRBRIDGE_ADDRESS : ETHBRIDGE_ADDRESS, FLRBRIDGE_ABI, signer);

  //   try {
  //     let tx;
  //     if (currentToken.symbol === "BRT") {
  //       tx = await contract.bridgeERC(parseEther(amountToSend.toString()), parseEther(gasFees.toString()));
  //     } else if (currentToken.symbol === "ETH") {
  //       tx = await contract.bridgeWETH(parseEther(amountToSend.toString()), parseEther(gasFees.toString()));
  //     } else {
  //       tx = await contract.bridgeFLR(parseEther(amountToSend.toString()), parseEther(gasFees.toString()));
  //     }

  //     await tx.wait();
  //     console.log(tx);
  //   } catch (error) {
  //     console.error("Error: ", error);
  //   }
  // };

  const currentChain = () => {
    if (fromChain) {
      if (currentToken.symbol === "ETH") {
        return "NATIVE";
      } else {
        return "ERC";
      }
    } else {
      if (currentToken.symbol === "FLR") {
        return "NATIVE";
      } else {
        return "ERC";
      }
    }
  };

  const isWrapped = () => {
    if (fromChain) {
      return currentToken.symbol !== "FLR";
    } else {
      return currentToken.symbol !== "ETH";
    }
  };

  const estimateGasFees = async () => {
    setLoadingGasFees(true);
    try {
      const response = await fetch(
        `/api/getPriceEstimate?chain=${fromChain ? "ETH" : "FLR"}&tokenType=${currentChain()}`,
      );
      const data = await response.json();
      console.log(data);
      const gasFee = formatUnits(BigInt(Math.floor(data.gasFee)), 18);
      console.log(gasFee);
      setGasFees(Number(gasFee));
    } catch (error) {
      console.error(error);
    }
    setLoadingGasFees(false);
  };

  const changeToken = (symbol: string) => {
    setCurrentToken(tokens.find(token => token.symbol === symbol) as Token);
    setAmountToSend(0);
    estimateGasFees();
  };

  useEffect(() => {
    estimateGasFees();
  }, []);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10 text-black">
        <div className="w-2/5 bg-white rounded-2xl p-7 space-y-4">
          <div className="flex flex-row space-x-5">
            <p className="font-semibold text-base">Token</p>
            <div className="dropdown">
              <div tabIndex={0} role="button" className="btn m-1 rounded-xl">
                <img src={currentToken.icon} alt={currentToken.symbol} className="w-6 h-6" />
                <p className="ml-2">
                  {currentToken.symbol != "BRT" && isWrapped() ? "w" + currentToken.symbol : currentToken.symbol}
                </p>
                <svg
                  className="w-6 h-6 text-gray-800"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 9-7 7-7-7"
                  />
                </svg>
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
                <li onClick={() => changeToken("ETH")}>
                  <a>{fromChain ? "wETH" : "ETH"}</a>
                </li>
                <li onClick={() => changeToken("FLR")}>
                  <a>{fromChain ? "FLR" : "wFLR"}</a>
                </li>
                <li onClick={() => changeToken("BRT")}>
                  <a>BRT</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="w-full bg-[#F5F5F5] p-4 rounded-2xl">
            <span className="text-xs">From</span>
            <div className="flex flex-row justify-between items-center">
              <div>{fromChain ? "Flare" : "Ethereum"}</div>
              <div className="flex flex-row items-center space-x-3">
                <input
                  type="number"
                  placeholder="Amount"
                  className="input bg-[#F5F5F5] w-fit max-w-xs text-end"
                  onChange={e => {
                    setAmountToSend(Number(e.target.value));
                  }}
                />
                <p className="text-blue-500">Max</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <svg
              className="w-6 h-6 text-gray-800"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              onClick={() => {
                setFromChain(prev => (prev ? 0 : 1));
                estimateGasFees();
                setAmountToSend(0);
              }}
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.7 7.7A7.1 7.1 0 0 0 5 10.8M18 4v4h-4m-7.7 8.3A7.1 7.1 0 0 0 19 13.2M6 20v-4h4"
              />
            </svg>
          </div>
          <div className="w-full bg-[#F5F5F5] p-4 rounded-2xl">
            <span className="text-xs">To</span>
            <div className="flex flex-row justify-between items-center">
              <div>{fromChain ? "Ethereum" : "Flare"}</div>
              <div className="flex flex-row items-center space-x-3">
                <div className="flex flex-row items-center gap-x-1">
                  {amountToSend} {currentToken.symbol} +{" "}
                  {loadingGasFees ? (
                    <span className="loading loading-dots loading-xs"></span>
                  ) : (
                    <p>
                      {gasFees} {fromChain ? "FLR" : "ETH"}
                    </p>
                  )}
                  <div className="tooltip" data-tip="Amount + Tx Fees">
                    <button className="btn btn-ghost hover:bg-[#F5F5F5] bg-[#F5F5F5]">
                      <svg
                        className="w-6 h-6 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 11h2v5m-2 0h4m-2.6-8.5h0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              className="btn w-1/3 rounded-3xl text-xl font-bold"
              disabled={loadingGasFees || amountToSend === 0 || isLoadingETH}
              onClick={() => sendTokensOnETH()}
            >
              {isWrapped() ? "Approve" : "Send"}
              {isLoadingETH && <span className="loading ml-2"></span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

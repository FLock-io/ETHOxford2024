"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";

// import { useAccount } from "wagmi";

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

const Home: NextPage = () => {
  // const { address: connectedAddress } = useAccount();
  const [currentToken, setCurrentToken] = useState(tokens.find(token => token.symbol === "ETH") as Token);
  const [fromChain, setFromChain] = useState(0);
  const [amountToSend, setAmountToSend] = useState(0);
  const [gasFees, setGasFees] = useState(0);
  const [loadingGasFees, setLoadingGasFees] = useState(false);

  const estimateGasFees = async () => {
    setLoadingGasFees(true);
    // const gasFees = await estimateGasFees();
    setGasFees(0.01);
    setLoadingGasFees(false);
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
                <p className="ml-2">{currentToken.symbol}</p>
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
                <li onClick={() => setCurrentToken(tokens.find(token => token.symbol === "ETH") as Token)}>
                  <a>{fromChain ? "wETH" : "ETH"}</a>
                </li>
                <li onClick={() => setCurrentToken(tokens.find(token => token.symbol === "FLR") as Token)}>
                  <a>{fromChain ? "FLR" : "wFLR"}</a>
                </li>
                <li onClick={() => setCurrentToken(tokens.find(token => token.symbol === "BRT") as Token)}>
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
            <button className="btn w-1/3 rounded-3xl text-xl font-bold">Send</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

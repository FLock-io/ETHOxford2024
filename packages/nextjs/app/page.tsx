"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";

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
    icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
  },
  {
    symbol: "BRT",
    icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
  },
];

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [currentToken, setCurrentToken] = useState(tokens.find(token => token.symbol === "ETH") as Token);
  const [fromChain, setFromChain] = useState(0);

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
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
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
                <input type="text" placeholder="Amount" className="w-fit max-w-xs bg-[#F5F5F5] border-none" />
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
              onClick={() => setFromChain(prev => (prev ? 0 : 1))}
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.7 7.7A7.1 7.1 0 0 0 5 10.8M18 4v4h-4m-7.7 8.3A7.1 7.1 0 0 0 19 13.2M6 20v-4h4"
              />
            </svg>
          </div>
          <div className="w-full bg-[#F5F5F5] p-4 rounded-2xl">
            <span className="text-xs">To</span>
            <div className="flex flex-row justify-between items-center">
              <div>{fromChain ? "Ethereum" : "Flare"}</div>
              <div className="flex flex-row items-center space-x-3">
                <p>Amount</p>
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

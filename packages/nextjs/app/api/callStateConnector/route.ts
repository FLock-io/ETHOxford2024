import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';
import * as flare from "@flarenetwork/flare-periphery-contract-artifacts";
import * as utils from "@flarenetwork/flare-periphery-contract-artifacts/dist/coston/StateConnector/libs/ts/utils.js";

const FLARE_CONTRACTS = "@flarenetwork/flare-periphery-contract-artifacts";
const FLARE_RPC = "https://coston-api.flare.network/ext/C/rpc";
const ATTESTATION_PROVIDER_URL = "https://attestation-coston.aflabs.net";
const ATTESTATION_PROVIDER_API_KEY = "123456";
const FLARE_CONTRACT_REGISTRY_ADDR ="0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019";

export async function GET(req: NextRequest) {

    // const { tx } = req.query;

    const tx = "0x058085ffe461da281bab996f125629a7c2bc4c778ddbec345334a483cbe7df71"

    if (!tx) {
        return NextResponse.json({ error: 'Missing tx' });
    }
    try {
        const status = await checkTxValidity(tx as string);
        if (status === 1) {
            return NextResponse.json({ txValid: true });
        } else {
            return NextResponse.json({ txValid: false });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error in checkTxValidity ' });
    }
};

async function checkTxValidity(transactionHash: string): Promise<number> {
    // 1. Set up
    const network = "COSTON";
    const VERIFICATION_ENDPOINT = `${ATTESTATION_PROVIDER_URL}/verifier/${network.toLowerCase()}/AddressValidity/prepareRequest`;
    const ATTESTATION_ENDPOINT = `${ATTESTATION_PROVIDER_URL}/attestation-client/api/proof/get-specific-proof`;

    // const flare = await import(FLARE_CONTRACTS);
    // const utils = await import(`${FLARE_CONTRACTS}/dist/coston/StateConnector/libs/ts/utils.js`);
    const provider = new ethers.JsonRpcProvider(FLARE_RPC);
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('Missing PRIVATE_KEY environment variable');
    }
    const signer = new ethers.Wallet(privateKey, provider);

    // 2. Prepare Attestation Request
    const { encodeAttestationName } = utils;
    const rawAttestationRequest = {
        attestationType: encodeAttestationName("EVMTransaction"),
        sourceId: encodeAttestationName(`test${network.toUpperCase()}`),
        requestBody: {
            transactionHash: transactionHash,
            requiredConfirmations: 0,
            provideInput: false, //TODO: check if needed later
            listEvents: false, //TODO: check if needed later
            logIndices: [],
        },
    };

    const verifierResponse = await fetch(VERIFICATION_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-KEY": ATTESTATION_PROVIDER_API_KEY,
        },
        body: JSON.stringify(rawAttestationRequest),
    });
    const encodedAttestationRequest = await verifierResponse.json();

    // 3. Access Contract Registry
    const flareContractRegistry = new ethers.Contract(
        FLARE_CONTRACT_REGISTRY_ADDR,
        flare.nameToAbi("FlareContractRegistry", "coston").data,
        provider
    );

    // 4. Retrieve the State Connector Contract Address
    const stateConnectorAddress = await flareContractRegistry.getContractAddressByName("StateConnector");
    const stateConnector = new ethers.Contract(
        stateConnectorAddress,
        flare.nameToAbi("StateConnector", "coston").data,
        signer
    );

    // 5. Request Attestation from the State Connector Contract
    const attestationTx = await stateConnector.requestAttestations(encodedAttestationRequest.abiEncodedRequest);
    const receipt = await attestationTx.wait();
    const block = await provider.getBlock(receipt.blockNumber);

    // 6. Calculate Round ID
    const roundOffset = await stateConnector.BUFFER_TIMESTAMP_OFFSET();
    const roundDuration = await stateConnector.BUFFER_WINDOW();
    const submissionRoundID = block ? Number((BigInt(block.timestamp) - roundOffset) / roundDuration) : 0;

    // 7. Wrap the remaining logic in a Promise to handle async polling and final verification
    return new Promise<number>(async (resolve, reject) => {
        let prevFinalizedRoundID = 0;
        setTimeout(async function poll() {
            const lastFinalizedRoundID = Number(await stateConnector.lastFinalizedRoundId());
            if (prevFinalizedRoundID != lastFinalizedRoundID) {
                prevFinalizedRoundID = lastFinalizedRoundID;
            }
            if (lastFinalizedRoundID < submissionRoundID) {
                setTimeout(poll, 10000);
                return;
            }

            // 8. Retrieve Proof
            const proofRequest = {
                roundId: submissionRoundID,
                requestBytes: encodedAttestationRequest.abiEncodedRequest,
            };

            const providerResponse = await fetch(ATTESTATION_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": ATTESTATION_PROVIDER_API_KEY,
                },
                body: JSON.stringify(proofRequest),
            });
            const proof = await providerResponse.json();
            if (proof.status !== "OK") {
                reject(new Error("Proof retrieval failed"));
                return;
            }

            // 9. Send Proof to Verifier Contract
            // Unpacked attestation proof to be used in a Solidity contract.
            const fullProof = {
                merkleProof: proof.data.merkleProof,
                data: {
                    ...proof.data,
                    ...proof.data.request,
                    ...proof.data.response,
                    status: proof.status,
                }
            };

            console.log("Sending the proof for verification...");

            const txVerifier = new ethers.Contract(
            flare.nameToAddress("IEVMTransactionVerification", "coston"),
            flare.nameToAbi("IEVMTransactionVerification", "coston").data,
            signer
            );

            const isVerified = await txVerifier.verifyEVMTransaction(fullProof);
            if (isVerified) {
                const { status } = fullProof.data.responseBody;
                resolve(status); // Resolve with the transaction status
            } else {
                reject(new Error("Attestation verification failed"));
            }
        }, 10000);
    });
}

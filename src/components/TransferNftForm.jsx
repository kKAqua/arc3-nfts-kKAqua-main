import { useWallet } from "@txnlab/use-wallet";
import { useState } from "react";
import { getAlgodClient } from "../clients";
import Button from "./Button";
import algosdk from 'algosdk';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const network = process.env.NEXT_PUBLIC_NETWORK || "SandNet";
const algod = getAlgodClient(network);

export default function TransferNFTForm() {
  const { activeAddress, signTransactions, sendTransactions } = useWallet();
  const [assetFile, setAssetFile] = useState(null);
  const [txnref, setTxnRef] = useState("");
  const [txnUrl, setTxnUrl] = useState("");
  const [error, setError] = useState("");
  const [metadataCid, setMetadataCid] = useState("");
  
  // Load environment variables for assetID and recipient address
  const amountToTransfer = 5; // The amount of tokens to transfer for minting
  const assetID = parseInt(process.env.NEXT_PUBLIC_FT_ASSET_ID, 10); // Load ASA ID from environment variables
  const recipientAddress = process.env.NEXT_PUBLIC_DEPLOYER_ADDR; // Load deployer address from environment variables

  const getTxnRefUrl = (txId) => {
    if (network === "SandNet") {
      return `https://app.dappflow.org/explorer/transaction/${txId}`;
    } else if (network === "TestNet") {
      return `https://testnet.algoexplorer.io/tx/${txId}`;
    }
    return "";
  };

  const handleFileChange = async (e) => {
    setAssetFile(e.target.files[0]);
  };

  // Function to transfer tokens before minting the NFT
  const transferTokens = async () => {
    try {
      const params = await algod.getTransactionParams().do();

      // Construct the transfer transaction
      const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: activeAddress,
        to: recipientAddress, // Use deployer address from environment variables
        assetIndex: assetID,  // Use ASA ID from environment variables
        amount: amountToTransfer,
        suggestedParams: params,
      });

      // Sign the transaction
      const signedTxn = await signTransactions([txn.toByte()]);

      // Send the transaction
      const sendResponse = await sendTransactions(signedTxn);
      setTxnRef(sendResponse.txId);
      setTxnUrl(getTxnRefUrl(sendResponse.txId));

      return sendResponse;
    } catch (error) {
      console.error("Token transfer failed:", error);
      throw new Error("Token transfer failed, please try again.");
    }
  };

  // Function to handle form submission and initiate the minting process
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const assetName = e.target["asset-name"].value;
    const desc = e.target["description"].value;
    console.log(assetName, desc, assetFile);

    if (!assetFile) {
      setError("Please upload a file first!");
      return;
    }

    try {
      // First, transfer tokens before minting the NFT
      await transferTokens();

      // Use FormData to package the file and other fields
      const formData = new FormData();
      formData.append("file", assetFile);
      formData.append("assetName", assetName);
      formData.append("desc", desc);

      // Call the server-side API route to upload the file and mint the NFT
      const response = await axios.post('/api/upload-to-ipfs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        const { metadataCid } = response.data;
        setMetadataCid(metadataCid);
        alert(`Successfully uploaded to IPFS and minted. Metadata CID: ${metadataCid}`);
      } else {
        setError('Minting failed, please try again later.');
      }
    } catch (error) {
      console.error("Minting failed:", error);
      setError("Minting failed, please try again later.");
    }
  };

  return (
    <div className="w-full">
      {activeAddress && txnref && (
        <p className="mb-4 text-left">
          <a href={txnUrl} target="_blank" className="text-blue-500">
            Tx ID: {txnref}
          </a>
        </p>
      )}
      {error && <p className="mb-4 text-red-500">{error}</p>}
      {metadataCid && <p className="mb-4 text-green-500">Metadata CID: {metadataCid}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4 w-full">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="asset-name">
            Asset Name:
          </label>
          <input type="text" id="asset-name" className="w-full" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description:
          </label>
          <textarea id="description" className="w-full" required></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Upload Image:
          </label>
          <input type="file" id="file-upload" accept="image/*" onChange={handleFileChange} required />
        </div>
        <Button label="Mint NFT" type="submit" />
      </form>
    </div>
  );
}

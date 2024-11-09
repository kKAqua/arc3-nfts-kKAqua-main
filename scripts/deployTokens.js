import * as dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });
import { getAlgodClient } from "../src/clients/index.js";
import algosdk from "algosdk";

const network = process.env.NEXT_PUBLIC_NETWORK || "SandNet";
const algodClient = getAlgodClient(network);

// get creator account
const deployer = algosdk.mnemonicToSecretKey(process.env.NEXT_PUBLIC_DEPLOYER_MNEMONIC);
// get buyer account
const buyer = algosdk.mnemonicToSecretKey(process.env.NEXT_PUBLIC_BUYER_MNEMONIC);

(async () => {
  try {
    // Get transaction parameters for asset creation
    const params = await algodClient.getTransactionParams().do();

    // Create a new asset
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: deployer.addr,
      total: 1000000,
      decimals: 0,
      assetName: "NTUToken",
      unitName: "NTU",
      defaultFrozen: false, 
      manager: deployer.addr, 
      suggestedParams: params,
    });

    // Sign and send the asset creation transaction
    const signedTxn = txn.signTxn(deployer.sk);
    const tx = await algodClient.sendRawTransaction(signedTxn).do();
    console.log("Transaction ID:", tx.txId);

    // Wait for asset creation confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);
    const assetID = confirmedTxn["asset-index"];
    console.log("Asset ID:", assetID);

    // Buyer account opts-in to the asset
    const optInParams = await algodClient.getTransactionParams().do();
    const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: buyer.addr,
      to: buyer.addr,
      amount: 0, // Opt-in with zero amount
      assetIndex: assetID,
      suggestedParams: optInParams,
    });

    // Sign and send the opt-in transaction using the buyer's private key
    const signedOptInTxn = optInTxn.signTxn(buyer.sk);
    const optInTx = await algodClient.sendRawTransaction(signedOptInTxn).do();
    console.log("Opt-in Transaction ID:", optInTx.txId);

    // Wait for opt-in confirmation
    await algosdk.waitForConfirmation(algodClient, optInTx.txId, 4);
    console.log(`Buyer account successfully opted into asset with Asset ID: ${assetID}`);

    // Transfer 100 tokens from deployer to buyer
    const transferParams = await algodClient.getTransactionParams().do();
    const transferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: deployer.addr,
      to: buyer.addr,
      amount: 100, // Transfer 100 tokens
      assetIndex: assetID,
      suggestedParams: transferParams,
    });

    // Sign and send the transfer transaction
    const signedTransferTxn = transferTxn.signTxn(deployer.sk);
    const transferTx = await algodClient.sendRawTransaction(signedTransferTxn).do();
    console.log("Transfer Transaction ID:", transferTx.txId);

    // Wait for confirmation of the transfer transaction
    await algosdk.waitForConfirmation(algodClient, transferTx.txId, 4);
    console.log(`100 tokens successfully transferred from deployer to buyer with Transaction ID: ${transferTx.txId}`);
  } catch (error) {
    console.error("Error creating, opting-in, or transferring asset:", error);
  }
})();
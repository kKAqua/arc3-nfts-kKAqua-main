ZHANG Haifeng, G2403334F

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/OSbSZWub)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=16447250&assignment_repo_type=AssignmentRepo)

# Mint ARC3 NFTs
In this assessment, you are required to create a Dapp that allows users to mint their own NFT by paying a fee with your token:

### Part 1: Create and transfer fungible tokens
1. Deploy a fungible token using the `seller` account. You will be using this token to "pay" for minting NFTs.
2. Transfer 100 fungible tokens to your buyer account.
3. Complete the code in `deployTokens.js` to do this.

### Part 2: Updating the Dapp
1. Your Dapp should be able to allow end users to connect to it via web3 wallets and mint NFTs.
2. Your Dapp should have a frontend that allows users to mint a new NFT following the ARC3 standard. The digital content of the NFTs are images. They can be found in the `assets/nft` folder or you can use your own assets.
3. The created NFTs should follow [ARC3](https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0003.md) standards. This includes

- Asset url contains the IPFS url of the JSON metadata. Append '#arc3' to the end of this url also.
- Within the JSON metadata, it should contain the IPFS url of the image file. The JSON should look like this,
```
{
    "name": "<NFT name>",
    "description": "<NFT description>",
    "image": "<ipfs hash>",
    "image_mimetype": "<asset file type>",
}
```

The `name` and `description` will come from the form input, while the `image` and `image_mimetype` will be from pinning the file.

4. Use an _atomic transfer_ to pay the fee with the token deployed in part 1. Each mint should cost `5 fungible tokens`. This is to be paid to the `seller` account.

### Part 3: TestNet
Your Dapp should also be able to run on TestNet. If you are deploying assets / NFTs on TestNet, please ensure the following,

1. Import your accounts by updating the duplicated `.env` file. Make sure they are funded via the [dispenser](https://bank.testnet.algorand.network/).
2. Do *NOT* import any account mnemonics to the frontend to sign transactions.

## Setup instructions

### 1. Install packages
Run `yarn install`

### 2. Update environement variables
1. Copy `.env.example` to `.env.local`.
2. Update Algorand Sandbox credentials in `.env.local` file.

### 3. Setup Pinata IPFS
1. Create a free account on [Pinata](https://www.pinata.cloud/)
2. Generate API key via account page.
3. Update `.env.local` file with the credentials.

### 4. Deploying tokens and NFTs
Run `yarn tsx scripts/deployTokens.js`

### 8. Run the Dapp
Run `yarn dev`

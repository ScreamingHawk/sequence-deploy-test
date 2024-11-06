# Sequence Deploy Test

This script allows you to deploy a 1 of 1 sequence wallet to your configured network.

## Usage

Install dependencies with the following command:

```bash
yarn
```

Copy `.env.sample` to `.env` and fill in the required fields.

> [!TIP]
> Leave the `PRIVATE_KEY` field empty to prepare deployment data without deploying.
> Leave the `SIGNER_ADDRESS` field empty to use a random signer for the 1 of 1 wallet.

Run the script with the following command:

```bash
yarn deploy
```

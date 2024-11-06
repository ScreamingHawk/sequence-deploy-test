import { commons, v2 } from "@0xsequence/core";
import { Orchestrator } from "@0xsequence/signhub";
import { Wallet } from "@0xsequence/wallet";
import type { ethers, JsonRpcProvider } from "ethers";
import { V2_WALLET_CONTEXT } from "./constants";

export type WalletType = Wallet<
  v2.config.WalletConfig,
  v2.signature.Signature,
  v2.signature.UnrecoveredSignature | v2.signature.UnrecoveredChainedSignature
>;

const createWalletConfig = (signerAddress: string) => {
  return v2.coders.config.fromSimple({
    threshold: 1,
    checkpoint: 0,
    signers: [
      {
        address: signerAddress,
        weight: 1,
      },
    ],
  });
};

/**
 * Creates the Sequence wallet.
 */
export const deploy1of1 = async (
  signerAddress: string,
  provider: JsonRpcProvider,
  relayer?: ethers.Signer
): Promise<WalletType> => {
  const walletConfig = createWalletConfig(signerAddress);
  const address = commons.context.addressOf(
    V2_WALLET_CONTEXT,
    v2.coders.config.imageHashOf(walletConfig)
  );

  const wallet = new Wallet({
    coders: {
      signature: v2.signature.SignatureCoder,
      config: v2.config.ConfigCoder,
    },
    context: V2_WALLET_CONTEXT,
    config: walletConfig,
    chainId: (await provider.getNetwork()).chainId,
    address,
    orchestrator: new Orchestrator([]),
    provider,
  });

  console.log(`Deploying wallet at ${address} with signer ${signerAddress}`);

  if (await wallet.reader().isDeployed(address)) {
    console.log(`Already deployed`);
    return wallet
  }

  const txBundle = await wallet.buildDeployTransaction();
  if (!txBundle) {
    throw new Error("Failed to build deploy transaction");
  }
  console.log(JSON.stringify(txBundle, null, 2));

  const txData = commons.transaction.encodeBundleExecData({ ...txBundle });
  console.log(`Encoded transaction data: ${txData}`);

  if (!relayer) {
    console.log(`No relayer provided, skipping deployment`);
    return wallet;
  }
  
  // Do deployment
  const tx = await relayer.sendTransaction({
    to: txBundle.entrypoint,
    data: txData,
  });
  console.log(`Transaction sent: ${tx.hash}`);
  await tx.wait();
  console.log(`Transaction mined`);

  return wallet;
};

import { config as dotenvConfig } from 'dotenv'
import { JsonRpcProvider, Wallet } from 'ethers'
import { deploy1of1 } from './wallet'

dotenvConfig()

const { RELAYER_PRIVATE_KEY, SIGNER_ADDRESS, RPC_URL } = process.env

if (!RPC_URL) {
  throw new Error('Missing env vars')
}

const main = async () => {
  const provider = new JsonRpcProvider(RPC_URL)
  const relayer = RELAYER_PRIVATE_KEY ? new Wallet(RELAYER_PRIVATE_KEY, provider) : undefined
  if (!SIGNER_ADDRESS) {
    const randomSigner = Wallet.createRandom()
    console.log('Random signer:', randomSigner.address)
    await deploy1of1(randomSigner.address, provider, relayer)
  } else {
    await deploy1of1(SIGNER_ADDRESS, provider, relayer)
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })

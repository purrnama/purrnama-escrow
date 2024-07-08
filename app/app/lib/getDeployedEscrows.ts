import {
  Alchemy,
  AssetTransfersCategory,
  AssetTransfersResult,
  Network,
  TransactionResponse,
} from "alchemy-sdk";
import { ContractRunner, ethers, Provider } from "ethers";
import Escrow from "../../artifacts/contracts/Escrow.sol/Escrow.json";
import "dotenv/config";

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
});

export default async function getDeployedEscrows(
  address: string,
  signer: ContractRunner,
  provider: Provider
) {
  const transfers: AssetTransfersResult[] = [];

  let res = await alchemy.core.getAssetTransfers({
    fromBlock: "0x0",
    toBlock: "latest",
    fromAddress: address,
    excludeZeroValue: false,
    category: [AssetTransfersCategory.EXTERNAL],
  });
  transfers.push(...res.transfers);
  /*
  while (res.pageKey) {
    let pageKey = res.pageKey;
    res = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      toBlock: "latest",
      fromAddress: address,
      excludeZeroValue: false,
      category: [AssetTransfersCategory.EXTERNAL],
      pageKey: pageKey,
    });
    transfers.push(...res.transfers);
  }
*/
  const deployments = transfers.filter(
    (transfer: AssetTransfersResult) => transfer.to === null
  );
  const txHashes = deployments.map((deployment) => deployment.hash);

  const promises = txHashes.map((hash) =>
    alchemy.core.getTransactionReceipt(hash)
  );

  const receipts = await Promise.all(promises);
  const contractAddresses = receipts.map((receipt) => receipt?.contractAddress);

  const contracts = contractAddresses.map((contractAddress) => {
    return new ethers.Contract(contractAddress, Escrow.abi, signer);
  });

  const escrowsPromises = contracts
    .filter(async (contract) => {
      const arbiter = await contract.arbiter();
      if (!arbiter) {
        return false;
      }
      return true;
    })
    .map(async (contract) => {
      const contractAddress = contract.getAddress();
      return {
        address: await contractAddress,
        arbiter: (await contract.arbiter()) as string,
        beneficiary: (await contract.beneficiary()) as string,
        value: (await provider.getBalance(contractAddress)).toString(),
      };
    });

  const escrows: Escrow[] = await Promise.all(escrowsPromises);
  return escrows;
}

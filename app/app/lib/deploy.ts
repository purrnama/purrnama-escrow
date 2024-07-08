import { AddressLike, BigNumberish, ContractRunner, ethers } from "ethers";
import Escrow from "../../artifacts/contracts/Escrow.sol/Escrow.json";

export default async function deploy(
  signer: ContractRunner,
  arbiter: AddressLike,
  beneficiary: AddressLike,
  value: BigNumberish
) {
  const factory = new ethers.ContractFactory(
    Escrow.abi,
    Escrow.bytecode,
    signer
  );
  return factory.deploy(arbiter, beneficiary, { value });
}

import { ethers } from "ethers";

export default function Escrow({
  address,
  arbiter,
  beneficiary,
  value,
}: Escrow) {
  return (
    <div className="flex flex-col p-4 rounded-md border-solid border-2 space-y-2">
      <h1 className="text-xl font-sans font-bold">Escrow {address}</h1>
      <hr />
      <div>
        <h2 className="text-xl font-sans font-bold">Arbiter</h2>
        <p>{arbiter}</p>
      </div>
      <div>
        <h2 className="text-xl font-sans font-bold">Beneficiary</h2>
        <p>{beneficiary}</p>
      </div>
      <div>
        <h2 className="text-xl font-sans font-bold">Value</h2>
        <p>{ethers.formatEther(value).toString() + " Ξ"}</p>
      </div>
    </div>
  );
}

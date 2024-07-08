"use client";
import { AddressLike, ethers, Signer } from "ethers";
import { useEffect, useState } from "react";
import deploy from "./lib/deploy";
import Escrow from "./components/escrow";
import EscrowContract from "../artifacts/contracts/Escrow.sol/Escrow.json";
import "dotenv/config";

export default function HomePage() {
  const provider =
    typeof window !== "undefined" &&
    new ethers.BrowserProvider(window.ethereum);
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [signer, setSigner] = useState<Signer>();
  const [arbiter, setArbiter] = useState<AddressLike>();
  const [beneficiary, setBeneficiary] = useState<AddressLike>();
  const [deposit, setDeposit] = useState<string>();
  const [isFetched, setIsFetched] = useState<boolean>(false);

  useEffect(() => {
    async function getAccounts() {
      if (provider) {
        const s = await provider.getSigner();
        setSigner(s);
      }
    }
    getAccounts();
  }, []);

  useEffect(() => {
    async function getEscrow() {
      if (signer) {
        const contract = new ethers.Contract(
          "0x214e51cf02265515b9a23eed6567c5ed86f8219b",
          EscrowContract.abi,
          signer
        );
        const escrow: Escrow = {
          address: "0x214e51cf02265515b9a23eed6567c5ed86f8219b",
          arbiter: (await contract.arbiter()) as string,
          beneficiary: (await contract.beneficiary()) as string,
          value: (
            await provider.getBalance(
              "0x214e51cf02265515b9a23eed6567c5ed86f8219b"
            )
          ).toString(),
        };
        setEscrows([...escrows, escrow]);
      }
    }
    getEscrow();
  }, [signer]);

  async function onClickDeploy() {
    if (!ethers.isAddress(arbiter)) {
      alert("Invalid arbiter address");
      return;
    }
    if (!ethers.isAddress(beneficiary)) {
      alert("Invalid beneficiary address");
      return;
    }
    const value = ethers.parseEther(deposit.toString());
    const contract = await deploy(signer, arbiter, beneficiary, value);

    const escrow: Escrow = {
      address: await contract.getAddress(),
      arbiter,
      beneficiary,
      value: value.toString(),
    };

    setEscrows([...escrows, escrow]);
  }

  return (
    <div>
      <div className="w-full text-center py-8">
        <h1 className="text-3xl font-sans font-black">purrnama escrow</h1>
        <p className="font-sans">
          Use Sepolia testnet to interact with this dapp
        </p>
      </div>
      <div className="container mx-auto grid grid-cols-3 gap-8">
        <div className="h-max p-6 rounded-md border-solid border-2 flex flex-col space-y-4 shadow-lg">
          <h1 className="text-xl font-sans font-extrabold">New Contract</h1>

          <label>
            Arbiter Address
            <input
              className="w-full h-8 p-2 border-spacing-0 border-2 rounded-md"
              type="text"
              id="arbiter"
              onInput={(e) => {
                setArbiter(e.currentTarget.value);
              }}
            ></input>
          </label>
          <label>
            Beneficiary Address
            <input
              className="w-full h-8 p-2 border-spacing-0 border-2 rounded-md"
              type="text"
              id="beneficiary"
              onInput={(e) => {
                setBeneficiary(e.currentTarget.value);
              }}
            ></input>
          </label>
          <label>
            Deposit Amount (Ether)
            <input
              className="w-full h-8 p-2 border-spacing-0 border-2 rounded-md"
              type="number"
              id="deposit"
              onInput={(e) => {
                setDeposit(e.currentTarget.value);
              }}
            ></input>
          </label>
          <button
            className="w-max px-8 py-2 border-solid border-2 rounded-md shadow-sm hover:shadow-lg"
            id="deploy"
            onClick={onClickDeploy}
          >
            Deploy
          </button>
        </div>
        <div className="col-span-2 p-6 rounded-md border-solid border-2 flex flex-col space-y-4 shadow-lg">
          <h1 className="text-xl font-sans font-extrabold">
            Deployed Contracts
          </h1>
          {escrows.map((escrow: Escrow) => {
            return <Escrow key={escrow.address} {...escrow} />;
          })}
        </div>
      </div>
    </div>
  );
}

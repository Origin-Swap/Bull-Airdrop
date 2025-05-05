import { ethers } from 'ethers';
import { CLAIM_CONTRACT_ABI } from '../abis/ClaimContract';
import { IERC20ABI } from '../abis/ClaimContract';

type ClaimContractInterface = ethers.Interface & {
  // Constants
  getFunction(name: "CLAIM_AMOUNT"): ethers.FunctionFragment;
  getFunction(name: "CLAIM_FEE"): ethers.FunctionFragment;
  getFunction(name: "REFERRAL_FEE"): ethers.FunctionFragment;
  getFunction(name: "REFERRAL_REWARD"): ethers.FunctionFragment;

  // Functions
  getFunction(name: "claim"): ethers.FunctionFragment;
  getFunction(name: "claimCount"): ethers.FunctionFragment;
  // Add all other function fragments
};

export type ClaimContract = ethers.Contract & {
  // Constants
  CLAIM_AMOUNT: () => Promise<bigint>;
  CLAIM_FEE: () => Promise<bigint>;
  REFERRAL_FEE: () => Promise<bigint>;
  REFERRAL_REWARD: () => Promise<bigint>;

  // Functions
  claim: (
    referrer: string,
    overrides?: { value: ethers.BigNumberish }
  ) => Promise<ethers.ContractTransactionResponse>;
  claimCount: (address: string) => Promise<bigint>;
  // Add all other function signatures
};

export type IERC20 = ethers.Contract & {
  transfer: (
    to: string,
    amount: ethers.BigNumberish
  ) => Promise<ethers.ContractTransactionResponse>;
  balanceOf: (account: string) => Promise<bigint>;
};

export function getClaimContract(
  address: string,
  signer: ethers.Signer
): ClaimContract {
  if (!address || !ethers.isAddress(address)) {
    throw new Error(`Invalid contract address: ${address}`);
  }
  return new ethers.Contract(
    address,
    CLAIM_CONTRACT_ABI,
    signer
  ) as ClaimContract;
}

export function getTokenContract(
  address: string,
  signer: ethers.Signer
): IERC20 {
  if (!address || !ethers.isAddress(address)) {
    throw new Error(`Invalid token address: ${address}`);
  }
  return new ethers.Contract(
    address,
    IERC20ABI,
    signer
  ) as IERC20;
}

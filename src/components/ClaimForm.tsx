import { useState, useEffect } from 'react';
import { BrowserProvider, formatEther, formatUnits, parseEther, ZeroAddress, isAddress, ethers, Contract } from 'ethers';
import { toast } from 'react-toastify';
import { useAccount } from 'wagmi';
import { useSearchParams } from 'react-router-dom';
import { CLAIM_CONTRACT_ABI } from '../abis/ClaimContract';
import CustomConnectButton from './CustomConnectButton';
import Navbar from './Navbar';

const ClaimForm = () => {
  const contractAddress = "0x0e0ede761a52a80a848c3d875680279730f5709c";
  const tokenAddress = "0x64819710a53bdA8D345bf5C0352Cee562dCE0068";

  const { address: account, isConnected } = useAccount();
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [referrer, setReferrer] = useState('');
  const [claimCount, setClaimCount] = useState(0);
  const [totalClaimed, setTotalClaimed] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [contractBalance, setContractBalance] = useState(0);
  console.log(contractBalance);
  const [isLoading, setIsLoading] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const [searchParams] = useSearchParams();
  const [currentReferrer, setCurrentReferrer] = useState('');
  const [claimAmount, setClaimAmount] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  console.log(currentBalance);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setCurrentReferrer(ref);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isConnected && account) {
      setReferralLink(`${window.location.origin}${window.location.pathname}?ref=${account}`);
    }
  }, [isConnected, account]);

  useEffect(() => {
    const init = async () => {
      if (isConnected && account) {
        try {
          const provider = new BrowserProvider((window as any).ethereum);
          const signer = await provider.getSigner();
          setSigner(signer);

          const claimContract = new ethers.Contract(
            contractAddress,
            CLAIM_CONTRACT_ABI,
            signer
          );
          setContract(claimContract);

          const [amount, balance] = await Promise.all([
            claimContract.CLAIM_AMOUNT(),
            claimContract.getContractTokenBalance()
          ]);

          setClaimAmount(Number(formatUnits(amount.toString(), 18)));
          setContractBalance(Number(formatUnits(balance.toString(), 18)));

          await loadUserData(claimContract, account);
        } catch (error) {
          console.error("Initialization error:", error);
          toast.error(`Initialization failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    };

    init();
  }, [isConnected, account]);

  const loadUserData = async (contract: ethers.Contract, userAddress: string) => {
    try {
      const [count, claimed, refCount, refEarnings, balance] = await Promise.all([
        contract.claimCount(userAddress),
        contract.totalClaimedTokens(userAddress),
        contract.getReferralCount(userAddress),
        contract.getReferralEarnings(userAddress),
        contract.getContractTokenBalance()
      ]);

      // Convert BigInt to Number before subtraction
      const balanceNum = Number(formatUnits(balance.toString(), 18));
      const currentToken = balanceNum - 100000000;

      setClaimCount(Number(count.toString()));
      setTotalClaimed(Number(formatUnits(claimed.toString(), 18)));
      setReferralCount(Number(refCount.toString()));
      setReferralEarnings(Number(formatEther(refEarnings.toString())));
      setCurrentBalance(currentToken); // No need to format since we already converted
    } catch (error) {
      console.error("Data loading error:", error);
      toast.error("Failed to load user data");
    }
  };

  const handleClaim = async () => {
    if (!contract || !account || !signer) {
      toast.error("Wallet not connected");
      return;
    }

    setIsLoading(true);
    try {
      const fee = parseEther('0.0012');
      const isFirstClaim = claimCount === 0;
      const referrerAddress = (referrer || currentReferrer);
      const hasReferrer = isFirstClaim && referrerAddress && referrerAddress !== account;

      if (hasReferrer && !isAddress(referrerAddress)) {
        throw new Error("Invalid referrer address");
      }

      const tx = await contract.claim(
        hasReferrer ? referrerAddress : ZeroAddress,
        { value: fee }
      );

      await tx.wait();
      toast.success("Claim successful!");

      // Get the updated balance after claim
      const balance = await contract.getContractTokenBalance();
      console.log('Contract tokens:', formatUnits(balance, 18));

      // Update all states
      await Promise.all([
        loadUserData(contract, account),
        contract.getContractTokenBalance().then(b => {
          setContractBalance(Number(formatUnits(b.toString(), 18)));
        })
      ]);
    } catch (error: any) {
      console.error("Claim error:", error);
      let errorMessage = "Claim failed";
      if (error.reason) {
        errorMessage = error.reason.replace("execution reverted: ", "");
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      const input = document.createElement('input');
      input.value = referralLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      toast.success('Referral link copied!');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Token Claim Portal</h1>
          <CustomConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="w-full md:px-96 px-2 bg-white rounded-xl mt-6 overflow-hidden">
        <div className="p-6 border rounded-xl border-gray-300 mb-4 shadow-md">
          {currentReferrer && (
            <div className="mb-3 p-2 bg-blue-50 text-center rounded-lg text-sm text-blue-800">
              You're referred by: <span className="font-mono">{`${currentReferrer.slice(0, 6)}...${currentReferrer.slice(-4)}`}</span>
            </div>
          )}
          <h2 className="text-sm text-center text-gray-800 mb-1">Airdrop Progress</h2>

          <div className="w-full bg-gray-200 text-center rounded-full h-3 mt-2 mb-2">
            <div
              className="bg-blue-500 h-4 rounded-full"
              style={{ width: `${(currentBalance / 100000000) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 text-center mb-2">
            Claimed: {currentBalance.toLocaleString()} / 100,000,000 Tokens
          </p>

          <button
            onClick={handleClaim}
            disabled={isLoading || !contract || contractBalance < claimAmount}
            className={`w-full py-2 px-4 text-sm rounded-lg mt-4 text-white ${
              isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            } transition duration-200`}
          >
            {isLoading ? 'Processing...' : `Claim ${claimAmount.toLocaleString()} BULLs ( ~$10 )`}
          </button>

          <p className="text-xs text-gray-600 text-center my-2">
            Human Proof: 0.0012 BNB
          </p>

          {contractBalance < claimAmount && (
            <div className="mt-2 text-center text-red-500 text-sm">
              Contract has insufficient tokens to fulfill claims
            </div>
          )}
        </div>

        <div className="p-6 rounded-xl border border-gray-300 mt-4 shadow-md">
          <h2 className="text-sm text-center font-semibold text-gray-800 mb-4">Your Referral</h2>

          <div className="mb-4">
            <label className="block text-sm text-center text-gray-700 mb-1">Referral Link</label>
            <div className="flex">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-grow px-3 py-2 text-black border border-gray-300 rounded-l-lg text-sm truncate"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={copyReferralLink}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg text-sm font-medium transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 border border-gray-200 rounded-lg shadow-sm text-center">
              <p className="text-sm text-gray-500">Referrals</p>
              <p className="text-xl font-bold text-gray-800">{referralCount}</p>
            </div>

            <div className="bg-gray-50 p-3 border border-gray-200 rounded-lg shadow-sm text-center">
              <p className="text-sm text-gray-500">Token Rewards</p>
              <p className="text-xl font-bold text-gray-800">
                {(referralCount * 100).toLocaleString()}
              </p>
            </div>

            <div className="bg-gray-50 p-3 border border-gray-200 rounded-lg shadow-sm text-center">
              <p className="text-sm text-gray-500">ETH Rewards</p>
              <p className="text-xl font-bold text-gray-800">
                {referralEarnings.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimForm;

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface ReferralLinkProps {
  account: string | null;
}

const ReferralLink = ({ account }: ReferralLinkProps) => {
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    if (account) {
      const currentUrl = window.location.href.split('?')[0];
      setReferralLink(`${currentUrl}?ref=${account}`);
    }
  }, [account]);

  const copyToClipboard = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
    }
  };

  if (!account) return null;

  return (
    <div className="mt-6 bg-dark-light p-4 rounded-lg">
      <h3 className="text-white font-bold mb-2">Your Referral Link</h3>
      <div className="flex">
        <input
          type="text"
          value={referralLink}
          readOnly
          className="flex-grow bg-gray-700 text-white border border-gray-600 rounded-l py-2 px-3 focus:outline-none"
        />
        <button
          onClick={copyToClipboard}
          className="bg-primary-default hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-r transition duration-200"
        >
          Copy
        </button>
      </div>
      <p className="text-gray-400 text-xs mt-2">
        Share this link to earn 100 tokens for each friend who uses it on their first claim!
      </p>
    </div>
  );
};

export default ReferralLink;

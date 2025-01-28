import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import abi from "../../helper/ManagerFaucetAbi.json";
import { daimond } from '../../helper/Helper';
import { useNavigate } from 'react-router-dom';

const Card = ({ id, reserve, activeTable }) => {

  const navigate = useNavigate();
  const { address } = useAccount();

  if (!id) {
    return null;
  }

  const { data, error, isLoading } = useReadContract({
      abi,
      address: daimond,
      functionName: 'getPoolAt',
      args: [(id - 1).toString()],
      chainId: 97
  });
  
  if (isLoading) {
    return;
  }
  
  
  if (error) {
    return;
  }
  
  if (!data) {
    return;
  }

  const { id: poolId, poolDetails, virtualQuoteReserve, virtualBaseReserve } = data;

  const poolDetailsParsed = poolDetails ? JSON.parse(poolDetails) : {};
  const addressToCompare = address ? address : "0x0000000000000000000000000000000000000000";
  if (activeTable === "owner" && data.owner !== addressToCompare) {
    return;
  }

  const pricePerToken = Number(virtualQuoteReserve || BigInt(0)) / Number(virtualBaseReserve || BigInt(0));  // Token price estimation
  const marketCap = pricePerToken * Number(1000000000);

  return (

    <div
      key={data.id}
      className="rounded-lg shadow-md overflow-hidden cursor-pointer"
      onClick={() => navigate(`/token/bsc/${data.token}`)} // Navigate to /card-page with poolId as query param
    >
      {/* Card New Section */}
      <div className="cards dark">
        <div className="card-body">
          <img
            src={poolDetailsParsed.image || 'https://codingyaar.com/wp-content/uploads/chair-image.jpg'}
            className="card-img-top"
            alt="Token Logo"
          />
          <div className="text-section">
            <h5 className="card-title">{poolDetailsParsed.name}</h5>


            <span>Progress</span>
            <span className='hardcap'>Hard Cap</span>
            <div className="progress">
              <div className="progress-bar" role="progressbar" style={{ width: `${parseInt((data.virtualQuoteReserve - reserve.initialVirtualQuoteReserve) / (data.maxListingQuoteAmount + data.listingFee)) ** 100}%` }} aria-valuenow={`${parseInt((data.virtualQuoteReserve - reserve.initialVirtualQuoteReserve) / (data.maxListingQuoteAmount + data.listingFee)) ** 100}`} aria-valuemin="0" aria-valuemax="100">{parseInt((data.virtualQuoteReserve - reserve.initialVirtualQuoteReserve) / (data.maxListingQuoteAmount + data.listingFee)) ** 100}%</div>
            </div>
            <span className='price'>4.913k  <img src="https://cryptologos.cc/logos/bnb-bnb-logo.png" className="chainimg" alt="BNB" /></span>

            <span className='hardcap'><img src="https://cryptologos.cc/logos/bnb-bnb-logo.png" className="hardcapchainimg" alt="BNB" /> 10.000k</span>


            <p className="card-text">{poolDetailsParsed.description}</p>
          </div>
        </div>
        <hr />
        <p className='mcapdiv'>
          <span className="socialicon">
            <i className="fa fa-globe"></i>
            <i className="fa fa-twitter"></i>
          </span>
          <span className="MCap">
            MCap: {marketCap ? `$${marketCap.toFixed(2)}` : 'Calculating...'}
          </span>
        </p>
      </div>
    </div>
  );

};

export default Card;

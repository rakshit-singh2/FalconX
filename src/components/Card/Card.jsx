import React, { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import abi from "../../helper/ManagerFaucetAbi.json";
import { daimond } from '../../helper/Helper';
import { useNavigate } from 'react-router-dom';

const Card = ({ id }) => {
  const navigate = useNavigate(); // Hook to navigate to different routes
 

  // Ensure we have the ID available before making the contract call
  if (!id) {
    return null;
  }

  // Use the wagmi hook to read the contract
  const { data, error, isLoading } = useReadContract({
    abi,
    address: daimond,
    functionName: 'getPoolAt',
    args: [id.toString()], // Passing `id` as argument to the contract function
    chainId: 97
  });

  // Guard clause: Return early if loading or error
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Ensure data is available before destructuring
  if (!data) {
    return <div>No data available</div>;
  }

  // Destructuring the fetched data from the contract
  const { id: poolId,poolDetails,virtualQuoteReserve,virtualBaseReserve } = data;

  // Parse the poolDetails JSON string
  const poolDetailsParsed = poolDetails ? JSON.parse(poolDetails) : {};
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
          <div class="progress">
          <div class="progress-bar" role="progressbar" style={{width: '25%'}} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">25%</div>
          </div>
          <span className='price'>4.913k  <img src="https://cryptologos.cc/logos/bnb-bnb-logo.png" className="chainimg" alt="BNB" /></span> 
        
            <span className='hardcap'><img src="https://cryptologos.cc/logos/bnb-bnb-logo.png" className="hardcapchainimg" alt="BNB" /> 10.000k</span>
        

            <p className="card-text">{poolDetailsParsed.description}</p>
          </div>
        </div>
        <hr />
        <p className='mcapdiv'>
            <span className="socialicon">
            <i class="fa fa-globe"></i>
            <i class="fa fa-twitter"></i> 
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

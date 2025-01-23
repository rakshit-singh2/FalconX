import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { readContract } from 'wagmi/actions';
import { config } from '../../wagmiClient';
import Card from '../Card/Card';
import abi from "../../helper/ManagerFaucetAbi.json";
import { daimond } from '../../helper/Helper';


const NonListed = ( {activeTable } ) => {
  const [error, setError] = useState(null); // Error state
  const [totalTokens, setTotalTokens] = useState(null); // Total tokens count state
  const navigate = useNavigate(); // React Router hook for navigation

  useEffect(() => {
    const fetchPoolCount = async () => {
      try {
        // console.log("Fetching pool count...");
        const result = await readContract(config, {
          address: daimond,
          abi,
          functionName: 'getPoolCount',
          chainId: 97
        });
        setTotalTokens(result.toString()); // Save the result in state
      } catch (error) {
        // console.error("Error fetching pool count:", error);
        setError(error.message); // Set the error state
      }
    };

    fetchPoolCount();
  }, []); // This runs only once, when the component mounts

  if (error) {
    return <div className="flex justify-center items-center h-14">Error: {error}</div>;
  }

  return (
    <div>

      
      <div className="cardbox grid grid-cols-1 mb-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
        {
          Array.from({ length: totalTokens }, (_, index) => (
            <Card key={index} id={index}/>
          ))
        } 
      </div>

    </div>
  );
};

export default NonListed;

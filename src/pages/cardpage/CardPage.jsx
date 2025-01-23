import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { readContract } from 'wagmi/actions';
import abi from "../../helper/ManagerFaucetAbi.json";
import DegenFacetabi from "../../helper/DegenFacetAbi.json";
import { daimond } from '../../helper/Helper';
import TokenAbi from '../../helper/TokenAbi.json';
import { useAccount, useReadContract } from 'wagmi';
import logo from "../../assets/logo/logo.png";
import TradeEventList from '../../components/Statistics/TradeEventList';
import { config } from '../../wagmiClient';
import { Line } from 'react-chartjs-2';
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js';
import BuySell from '../../components/BuySell/BuySell';
import { useEffect } from 'react';
const CardPage = () => {
  const { token } = useParams();

  if (!token) {
    return <div className="flex justify-center items-center h-screen">Card not found</div>;
  }

  const { data, error, isLoading } = useReadContract({
    abi,
    address: daimond,
    functionName: 'getPoolInfo',
    args: [token],
    chainId: 97,
  });

  const { chain, address } = useAccount();

  const [amountOut, setAmountOut] = useState([0n, 0n, 0n, 0n, 0n]);
  const [isBuy, setIsBuy] = useState(true);
  const [txDone, setTxDone] = useState(0);
  const [balanceOf, setBalaceOf] = useState(0);

  const startTime = data?.startTime ? Math.floor(Number(data.startTime) / 1000) : 0;

  const fetchAmountOut = async (inputAmount) => {
    try {
      const result = await readContract(config, {
        abi: DegenFacetabi,
        address: daimond,
        functionName: 'getAmountOut',
        chainId: 97,
        args: [
          token,
          BigInt(inputAmount * 10 ** 18),
          isBuy,
        ],
      });
    } catch (error) {
      console.error('Error fetching amountOut:', error);
      setAmountOut([0n, 0n, 0n, 0n, 0n]);
    }
  };

  const fetchBalaceOf = async () => {
    try {
      const result = await readContract(config, {
        abi: TokenAbi,
        address: token,
        functionName: 'balanceOf',
        chainId: 97,
        args: [
          address,
        ],
      });
      setBalaceOf(result)
    } catch (error) {
      console.error('Error fetching amountOut:', error);
      setAmountOut([0n, 0n, 0n, 0n, 0n]);
    }
  };


  useEffect(() => {
    fetchBalaceOf();
  }, [address]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <img src={logo} alt="Loading Logo" className="w-24 h-24 animate-spin-slow" />
          <span className="text-lg text-gray-700 font-semibold">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-100">
        <span className="text-lg text-red-600 font-semibold">Error fetching data: {error.message}</span>
      </div>
    );
  }

  if (!data) {
    return <div className="flex justify-center items-center h-screen">Data not available</div>;
  }

  const poolDetailsParsed = data?.poolDetails ? JSON.parse(data.poolDetails) : {};
  const baseReserve = Number(data.virtualBaseReserve) / (10 ** 18);
  const quoteReserve = Number(data.virtualQuoteReserve) / (10 ** 18);
  const maxSupply = Number(data.maxListingBaseAmount) / (10 ** 18);

  const prices = [];
  const supplies = [];

  // Generate price points based on bonding curve
  for (let supply = 1; supply <= maxSupply; supply += maxSupply / 1000) {
    const adjustedBaseReserve = baseReserve + supply;
    const price = quoteReserve / adjustedBaseReserve;
    prices.push(price * (10 ** 9));
    supplies.push(supply);
  }

  Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);
  const chartData = {
    labels: supplies,
    datasets: [
      {
        label: 'Price vs. Supply',
        data: prices,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 1,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'Bonding Curve',
      },
    },
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: `Supply in ${chain?.nativeCurrency?.symbol ?? 'BNB'}`,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price in Gwei',
        },
      },
    },
  };

  let routerText = '';
  if (data?.router === '0xD99D1c33F9fC3444f8101754aBC46c52416550D1') {
    routerText = 'Pancake Swap';
  } else if (data?.router === '0xda8e9632c013c9d6a5fbabac9e2ecdf69706a306') {
    routerText = 'How Swap';
  }

  console.log({data})

  return (
<>
<div className="slidersection">
  <div className="container">
    <div className='row'>
       {/* leftbox */}
      <div className='col-md-3'>
          <div className='boxc'>
             <span class="socialicon">
            <a href='#'><i class="fa fa-globe"></i></a>
            <a href='#'><i class="fa fa-twitter"></i></a>
            <a href='#'><i class="fa fa-telegram"></i></a>
            <a href='#'><i class="fa fa-github"></i></a>
            </span>
            
          <p>Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet.</p>
          <hr className='separetar'></hr>
          <div className="tokeninfo">
          <h3 className="text-xl font-semibold text-gray-800">Token Info</h3>
          <ul className="mt-4 space-y-3 text-gray-600">
            <li><strong>Name :</strong> <span> {poolDetailsParsed.name}</span></li>
            <li><strong>Symbol :</strong> <span>{poolDetailsParsed.symbol}</span></li>
            <li><strong>Description : &nbsp; 
              </strong> {poolDetailsParsed.description}</li>
            <li><strong>Tag :</strong> <span>{poolDetailsParsed.Tag}</span></li>
            <li><strong>Router :</strong> <span>{routerText}</span></li>
            <li>
              <strong>Address :
                <a
                  href={`https://testnet.bscscan.com/token/${data?.token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 text-gray-500 hover:underline hover:text-gold"
                >
                  <span>{data?.token ? `${data.token.slice(0, 10)}...${data.token.slice(-9)}` : ''}</span>
                </a>
              </strong>
            </li>
            <li><strong>Start Time :</strong><span> {data?.startTime ? new Date(Number(data.startTime) * 1000).toLocaleString() : 'N/A'}</span></li>
          </ul>
        </div>

        <hr className='separetar'></hr>
        <div className='tokenomic'>
        <h3 className="text-xl font-semibold text-gray-800">Tokenomic</h3>
        <img className="h-50 rounded" src="/images/chart.png" alt="Token image" />

        </div>
          </div>
      </div>

      {/* centerbox */}
      <div className='col-md-6'>
        <div className='boxc tpllogo'>

        <div className='row detaillogo'>
          <div className='col-md-3'>
          <img className="h-50 rounded" src={poolDetailsParsed?.image} alt="Token image" />
          </div>
          <div className='col-md-9 lgs'>
            <h1 className='tokenname'>Bullforce Token</h1>
            </div>
        </div>
            
        </div>

        <div className='boxc'>
        <iframe width="100%" height="400" src="https://www.youtube.com/embed/acag6jqNCAg" title="🔸PipiLol - A Simple Dive into the Hidden Gem on #Core🔸" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>

        <div className='boxc AllTransactions'>
        <TradeEventList contractAddress={token} tx={txDone} />
        </div>
      </div>

      {/* rightbox */}
      <div className='col-md-3'>
      <div className="boxc bg-white p-6 rounded-lg">

         
          <p>Bonding Curve Progress (0.32%)</p>
          <div class="progress">
          <div class="progress-bar" role="progressbar" style={{ width: '25%' }} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">25%</div>
          </div>
          <p>When the market cap hits $79.4K, All liquidity from the bonding curve will be deposited into Raydium AMM V4 and burned. The progression accelerates as the price rises</p>

          <BuySell data={data} token={token} balanceOf={balanceOf}/>
          <p className='bonding'>Needs 91.7001 SOL to fill the bonding curve</p>
        </div>
        <div className='chartbox' style={{ width: '100%'}}>
          <Line data={chartData} options={options} />
        </div>

      </div>

      </div>
  </div>
</div>


    
    </>
  );
};


export default CardPage;

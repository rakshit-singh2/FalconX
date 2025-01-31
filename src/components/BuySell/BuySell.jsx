import React, { useEffect, useState } from 'react'
import { formatUnits } from 'ethers';
import { useAccount, useReadContract } from 'wagmi';
import { readContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions';
import { config } from '../../wagmiClient';
import { daimond } from '../../helper/Helper';
import DegenFacetabi from "../../helper/DegenFacetAbi.json";
import TokenABi from "../../helper/TokenAbi.json"

const BuySell = ({ data, token, balanceOf }) => {

    const { chain } = useAccount();

    const [amount, setAmount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSaleAvailable, setIsSaleAvailable] = useState(false);
    const [approve, setApprove] = useState(0);
    const [amountOut, setAmountOut] = useState([0n, 0n, 0n, 0n, 0n]);
    const [isBuy, setIsBuy] = useState(true);
    const [txDone, setTxDone] = useState(0);

    const startTime = data?.startTime ? Math.floor(Number(data.startTime) / 1000) : 0;

    useEffect(() => {
        const interval = setInterval(() => {
            const currentTime = Math.floor(new Date().getTime() / 1000);
            const difference = startTime - currentTime;

            if (difference <= 0) {
                setIsSaleAvailable(true);
                clearInterval(interval);
            } else {
                const days = Math.floor(difference / (24 * 3600));
                const hours = Math.floor((difference % (24 * 3600)) / 3600);
                const minutes = Math.floor((difference % 3600) / 60);
                const seconds = Math.floor(difference % 60);
                setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    useEffect(() => {
        if (amount <= 0 || !token) return; // Prevent fetching if amount is invalid
        fetchAmountOut(amount);
    }, [amount, isBuy, token]);

    const fetchAmountOut = async (inputAmount) => {
        try {
            const result = await readContract(config, {
                abi: DegenFacetabi,
                address: daimond[97],
                functionName: 'getAmountOut',
                chainId: 97,
                args: [
                    token,
                    BigInt(inputAmount * 10 ** 18),
                    isBuy,
                ],
            });
            setAmountOut(result);
        } catch (error) {
            console.error('Error fetching amountOut:', error);
            setAmountOut([0n, 0n, 0n, 0n, 0n]);
        }
    };

    const handleBuy = async () => {
        if (!token || !amount) return;

        try {
            const data = await writeContract(config, {

                address: daimond[97],
                abi: DegenFacetabi,
                functionName: 'buy',
                chainId: 97,
                args: [
                    token,
                    "0x0000000000000000000000000000000000000000",
                    BigInt(amount * 10 ** 18),
                    amountOut[0],
                    [],
                ],
                // value: BigInt(amount * 10 ** 18),
                value: BigInt(amount * 10 ** 18) + amountOut[2],
            });
            const receipt = await waitForTransactionReceipt(config, {
                hash: data,
            })
            setTxDone((prev) => prev + 1);
        } catch (error) {
            console.error('Error during buy:', error);
        }
    };

    const handleApprove = async () => {
        if (!token || !amount) return;

        try {
            const data = await writeContract(config, {
                address: token,
                abi: TokenABi,
                functionName: 'approve',
                chainId: 97,
                args: [
                    daimond[97],
                    BigInt(amount * 10 ** 18),
                ],
            });
            const receipt = await waitForTransactionReceipt(config, {
                hash: data,
            })
            setApprove(amount);
        } catch (error) {
            console.log('Error during approve:', error);
        }
    };

    const handleSell = async () => {
        if (!token || !approve) return;
        try {
            const data = await writeContract(config, {
                address: daimond[97],
                abi: DegenFacetabi,
                functionName: 'sell',
                chainId: 97,
                args: [
                    token,
                    "0x0000000000000000000000000000000000000000",
                    BigInt(approve * 10 ** 18),
                    amountOut[0] - amountOut[4],
                ],
            });

            const receipt = await waitForTransactionReceipt(config, {
                hash: data,
            })
            setApprove(0);
            setTxDone((prev) => prev + 1);
        } catch (error) {
            console.error('Error during sell:', error);
        }
    };

    const poolDetailsParsed = data?.poolDetails ? JSON.parse(data.poolDetails) : {};
    const baseReserve = Number(data.virtualBaseReserve) / (10 ** 18);
    const quoteReserve = Number(data.virtualQuoteReserve) / (10 ** 18);
    const maxSupply = Number(data.maxListingBaseAmount) / (10 ** 18);

    const prices = [];
    const supplies = [];

    // Function to format the received amount with 3 decimal places
    const formatAmount = (amount) => {
        return parseFloat(formatUnits(amount, 18)).toFixed(3);
    };

    return (

        
        <div className="mt-4 buysell">
            {isSaleAvailable ? (
                <>




                    <div className="btngroup flex mb-6">
                        <button
                            className={`buy px-6 py-3 text-white text-md font-semibold rounded-lg transition duration-300 w-full ${!isBuy ? '' : 'bg-gold'}`}
                            onClick={() => setIsBuy(true)}>
                            <h2>Buy Token</h2>
                        </button>
                        <button
                            className={`sell px-6 py-3 text-white text-md font-semibold rounded-lg  transition duration-300 w-full ${isBuy ? '' : 'bg-gold'}`}
                            onClick={() => setIsBuy(false)}>
                            <h2>Sell Token</h2>
                        </button>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-600">
                            Amount of {isBuy ? (chain?.nativeCurrency?.symbol || "Currency") : poolDetailsParsed.symbol}
                        </label>

                        <input
                            type="number"
                            className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Enter amount in ${poolDetailsParsed.symbol}`}
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            min="0"
                        />
                    </div>

                    <div className="text-black">
                        {isBuy ? (
                            <p>Buy Tax: <span className='receivedvalu'>{parseInt(data?.buyFeeRate)}%</span></p>
                        ) : (
                            <p>Sell Tax: <span className='receivedvalu'>{parseInt(data?.sellFeeRate)}%</span></p>
                        )}
                        <p> Received : <span className='receivedvalu'>{formatAmount(amountOut[0])} </span></p>
                        <p> Min Received : <span className='receivedvalu'>
                            {isBuy ?
                                formatAmount(amountOut[1]) * (1 - parseInt(data?.buyFeeRate) / 100) :
                                formatAmount(amountOut[1]) * (1 - parseInt(data?.sellFeeRate) / 100)
                            }
                        </span></p>
                        <p>Balance of : <span className='receivedvalu'>{formatAmount(balanceOf)}</span></p>
                    </div>
                    <div className="flex justify-between space-x-4">
                        {isBuy ? (
                            <button
                                className="lasstbutton w-full bg-gold text-white py-3 rounded-lg hover:bg-gold transition duration-300"
                                onClick={handleBuy}
                            >
                                Buy Token
                            </button>
                        ) : (
                            <>
                                {approve === 0 && (
                                    <button
                                        className="lasstbutton w-full bg-gray-500 text-white py-3 rounded-lg transition duration-300"
                                        onClick={handleApprove}
                                    >
                                        Approve
                                    </button>
                                )}
                                {approve > 0 && (
                                    <button
                                        className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition duration-300"
                                        onClick={handleSell}
                                    >
                                        Sell {approve}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center bg-gold from-blue-500 to-purple-600 p-6 rounded-lg shadow-lg w-full max-w-xs mx-auto">
                    <h2 className="text-2xl font-semibold text-white mb-4">Sale Starts In</h2>
                    <div className="flex space-x-4 mb-4">
                        {timeLeft && timeLeft.split(' ').length === 4 && (
                            <>
                                <div className="text-center text-white">
                                    <p className="text-lg font-bold">{timeLeft.split(' ')[0]}</p>
                                    <span className="text-sm">Days</span>
                                </div>
                                <div className="text-center text-white">
                                    <p className="text-lg font-bold">{timeLeft.split(' ')[1]}</p>
                                    <span className="text-sm">Hours</span>
                                </div>
                                <div className="text-center text-white">
                                    <p className="text-lg font-bold">{timeLeft.split(' ')[2]}</p>
                                    <span className="text-sm">Minutes</span>
                                </div>
                                <div className="text-center text-white">
                                    <p className="text-lg font-bold">{timeLeft.split(' ')[3]}</p>
                                    <span className="text-sm">Seconds</span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="w-full bg-white rounded-lg py-3 px-6 text-center text-black">
                        <p className="text-lg font-semibold">Sale will begin soon!</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BuySell

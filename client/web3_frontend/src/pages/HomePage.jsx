import React, { useState } from 'react';
import { ethers } from 'ethers';

function HomePage() {
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask and try again.");
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Connect to MetaMask</h1>
      {!account ? (
        <button onClick={connectWallet} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Connect
        </button>
      ) : (
        <div>
          <p>Connected Account:</p>
          <p style={{ fontWeight: 'bold' }}>{account}</p>
        </div>
      )}
    </div>
  );
}

export default HomePage;

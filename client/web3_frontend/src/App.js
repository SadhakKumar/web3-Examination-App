import React, { useEffect, useState } from "react";
import "./App.css";
import HomePage from "./pages/HomePage";
import StudentHome from "./pages/StudentHome";
import ExaminerHome from "./pages/ExaminerHome";
import CreateExam from "./pages/CreateExam";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import OnBoarding from "./pages/OnBoarding";
import Exam from "./pages/Exam";
import { Outlet } from "react-router-dom";
import Test from "./pages/Test";
import Declare from "./pages/Declare";

// Rainbowkit imports
import "@rainbow-me/rainbowkit/styles.css";

import {
  darkTheme,
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Navbar from "./components/Navbar";
import StudentEnrollment from "./pages/StudentEnrollment";

const queryClient = new QueryClient();

const ganache = {
  id: 1337,
  name: "Ganache",
  iconUrl:
    "https://seeklogo.com/images/G/ganache-logo-1EB72084A8-seeklogo.com.png",
  iconBackground: "#fff",
  nativeCurrency: { name: "Ganache", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["HTTP://127.0.0.1:7545"] },
  },
};

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains: [mainnet, polygon, optimism, arbitrum, base, ganache],
  ssr: false, // If your dApp uses server side rendering (SSR)
});

// /ip4/127.0.0.1/tcp/5001

// connect to the default API address http://localhost:5001




function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/student" element={<StudentHome />} />
              <Route path="/examiner" element={<Outlet />}>
                <Route path="/examiner" element={<ExaminerHome />} />
                <Route path="/examiner/declare" element={<Declare />} />
                <Route path="/examiner/create" element={<CreateExam />} />
              </Route>
              <Route path="/onboarding" element={<OnBoarding />} />
              <Route path="/exam" element={<Exam />} />
              <Route path="/exam/:id" element={<Test/>} />
              <Route path="/enrollment" element={<StudentEnrollment/>}/>
            </Routes>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;

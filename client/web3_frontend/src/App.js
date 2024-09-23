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
import { createHelia } from "helia";
import { createLibp2p } from "libp2p";
import { webSockets } from "@libp2p/websockets";
import { tcp } from "@libp2p/tcp";

import { mplex } from "@libp2p/mplex";
import { noise } from "@chainsafe/libp2p-noise";
import { kadDHT } from "@libp2p/kad-dht";
import { MemoryBlockstore } from "blockstore-core";
import { MemoryDatastore } from "datastore-core";
import { bootstrap } from "@libp2p/bootstrap";
import { yamux } from "@chainsafe/libp2p-yamux";
import { identify } from "@libp2p/identify";

function App() {
  const [helia, setHelia] = useState();
  const [helia2, setHelia2] = useState();

  const createNode = async () => {
    // the blockstore is where we store the blocks that make up files
    const blockstore = new MemoryBlockstore();

    // application-specific data lives in the datastore
    const datastore = new MemoryDatastore();

    // libp2p is the networking layer that underpins Helia
    const libp2p = await createLibp2p({
      datastore,
      addresses: {
        listen: ["/ip4/127.0.0.1/tcp/5001"],
      },
      transports: [webSockets()],
      connectionEncryption: [noise()],
      streamMuxers: [yamux()],
      peerDiscovery: [
        bootstrap({
          list: [
            "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
            "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
            "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
            "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
            "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
            "/ip4/104.131.131.82/udp/4001/quic-v1/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
          ],
        }),
      ],
      services: {
        identify: identify(),
      },
    });

    return await createHelia({
      datastore,
      blockstore,
      libp2p,
    });
  };

  const blockstore = new MemoryBlockstore();

  const makeHelia = async () => {
    // Set up libp2p node
    const libp2p = await createLibp2p({
      transports: [webSockets()],
      streamMuxers: [mplex()],
      connectionEncryption: [noise()],
      dht: kadDHT(),
      peerDiscovery: [
        bootstrap({
          list: [
            "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
            "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
            "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
            "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
          ],
        }),
      ],
    });

    // Create Helia node
    const helia = await createHelia({
      libp2p,
      ipfsOptions: {
        apiAddr: "/ip4/127.0.0.1/tcp/5001", // Local IPFS node HTTP API
      },
      blockstore,
    });

    setHelia(helia);
  };

  const makeNodes = async () => {
    const node1 = await createNode();
    const node2 = await createNode();
    setHelia(node1);
    setHelia2(node2);

    // connect them together
    const multiaddrs = node2.libp2p.getMultiaddrs();
    await node1.libp2p.dial(multiaddrs[0]);
  };
  useEffect(() => {
    // makeNodes();

    makeHelia();
  }, []);
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/student" element={<StudentHome />} />
        <Route path="/examiner" element={<Outlet />}>
          <Route path="/examiner" element={<ExaminerHome />} />
          <Route
            path="/examiner/create"
            element={<CreateExam helia={helia} />}
          />
        </Route>
        <Route path="/onboarding" element={<OnBoarding />} />
        <Route path="/exam" element={<Exam helia={helia2} />} />
      </Routes>
    </div>
  );
}

export default App;

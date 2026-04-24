# E-Land Records: Blockchain-Driven Land Governance 🛡️🏛️

[![GitHub repo](https://img.shields.io/badge/GitHub-Repository-blue.svg?logo=github)](https://github.com/Charithapriya123/elandrecords)
[![Hyperledger Fabric](https://img.shields.io/badge/Hyperledger%20Fabric-v2.x-2F3134.svg?logo=hyperledger)](https://www.hyperledger.org/use/fabric)
[![Next.js](https://img.shields.io/badge/Next.js-16+-black.svg?logo=next.js)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**E-Land Records** is a state-of-the-art Hyperledger Fabric blockchain solution for transparent, secure, and automated land registration. This platform integrates advanced cryptography, AI-driven digitization, and mathematical trust indexing to eliminate land-related fraud and administrative bottlenecks.

---

## 🏢 System Architecture

The network follows a multi-organization, multi-channel architecture for complete departmental isolation, data privacy, and accountability.

### Participating Organizations
- **Registration Department (Org1)**: Handles citizen on-boarding, Aadhaar-linked identity management, and initial land application submission. Operates within the citizen-facing channels and triggers the primary workflow.
- **Revenue Department (Org2)**: High-security verification node featuring AI-OCR, DigiLocker integration, and Revenue Inspector surveys. Holds the authority to validate property details and encumbrances.
- **Collectorate (Org3)**: Final Approval Authority overseeing the multi-signature endorsement process. Grants the ultimate approval to commit the transfer of ownership to the immutable ledger.

### Technology Stack
- **Ledger**: Hyperledger Fabric v2.x
- **Frontend**: Next.js 16+, React 19, TailwindCSS
- **Backend API**: Express.js (Fabric SDK) & FastAPI (AI Inference)
- **Database**: IPFS (Off-chain Document Storage), CouchDB (State Database)
- **AI/ML**: Python NLP/OCR Pipeline for land deed digitization
- **Security**: AES-256 Application-level Encryption & ABAC (Attribute-Based Access Control)

---

## 🔥 Innovative Core Features & End-to-End Workflows

### 🛡️ Privacy & Security Governance
- **AES-256 Cryptographic Pipeline**: Transparently encrypts sensitive PII (Aadhaar, Phone) before committing to the ledger. Only authorized peers can decrypt data on a need-to-know basis.
- **DigiLocker Integration**: Automated retrieval of government-certified documents via Aadhaar-authenticated handshakes and verifiable credentials.
- **IPFS Anchoring**: Off-chain storage of large deeds (PDFs/Images) with immutable CID (Content Identifier) anchoring on the blockchain to guarantee zero tampering.
- **ABAC Enforcement**: Role-based access verified via X.509 certificate attributes (e.g., Clerk vs. MRO vs. Collector permissions), directly within the chaincode.

### 🔢 Advanced Trust Indexer
- **Mathematical Scoring**: A weighted composite algorithm that calculates a **Trust Index (0-100)** for every application based on document validity, OCR match confidence, and surveyor feedback.
- **Fraud Detection Engine**: Automated monitors that flag "Hash Mismatches" if off-chain IPFS documents are tampered with or replaced maliciously.
- **Multi-Sig Tracking**: Enforces multi-signature end-to-end organizational endorsement policies (Org1 + Org2 + Org3) before any asset transfer is considered valid.

### 🤖 AI-Driven Digitization
- **NLP Document Parsing**: Automatically extracts Survey Numbers, Dimensions, and Owner facts from unstructured PDF deeds and uploaded images.
- **FastAPI Inference Bridge**: Asynchronous processing bridge for high-performance AI document analysis isolated from the blockchain consensus.
- **Ledger Verification Sync**: AI-verified facts are committed to the world state as a secondary validation layer, which human inspectors then review instead of doing manual data entry.

---

## � Repository Structure

```text
elandrecords/
├── chaincode/               # Hyperledger Fabric smart contracts
├── client/                  # Next.js 16 citizen and official dashboards
├── fabric-api/              # Express.js REST API gateway interacting with the ledger
├── fabric-samples/          # Underlying Fabric binaries & test-network config
├── setup-network.sh         # Network orchestration script
└── setorg*.sh               # Deployment scripts for individual organizations
```

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/Charithapriya123/elandrecords.git
cd elandrecords
```

### 2. Initialize the Blockchain Network
Setup the Hyperledger Fabric network, channels, and chaincode:
```bash
./setup-network.sh
```

### 3. Start the Backend API Gateway
```bash
cd fabric-api
npm install
npm start
```

### 4. Launch the Next.js Portals
```bash
cd ../client
npm install
npm run dev
```

Visit the application at: `http://localhost:3000`

---

## 🏗️ Detailed Departmental Workflows

### 1. Citizen Initiation
- User logs into the portal and submits a land registration request.
- PII is encrypted, and large documents are uploaded to IPFS. The IPFS Hash (CID) is embedded in the transaction payload.

### 2. Revenue Verification
- Application enters the Revenue Department dashboard.
- **DigiLocker** verifies identity attributes against Aadhaar.
- **AI-OCR Pipeline** extracts bounds/survey numbers.
- A Revenue Inspector conducts a field survey, logging GPS-tagged results to the chain.
- The Trust Indexer calculates a live score for the transaction. 

### 3. Final Endorsement
- The Joint Collector reviews the composite Trust Score, initial submission, and verified survey logic.
- If approved, a multi-signature transaction is formed and written to the ledger, legally transferring the asset.

---

## 📜 Technical Verification (CLI Proofs)

Verify the end-to-end integrity of the system using the following peer commands:

**1. Verify Data Encryption:**
```bash
source setorg2.sh
peer chaincode query -C mychannel -n land-registration \
  -c '{"function":"getApplication","Args":["APP_ID"]}' | jq '.userData'
```

**2. Check AI-Extracted Facts:**
```bash
peer chaincode query -C mychannel -n land-registration \
  -c '{"function":"getApplication","Args":["APP_ID"]}' | jq '.ocrData'
```

**3. Fetch Mathematical Trust Score:**
```bash
peer chaincode query -C mychannel -n land-registration \
  -c '{"function":"getApplication","Args":["APP_ID"]}' | jq '.trustScore'
```
# Smart Agent Wallet

<p align="center">
<img src="public/safeLiza.webp" alt="Safe Liza" width="600" />
</p>
<p align="center">
🚀 ✨ <b>Make sure to also check out the backend repo <a href="https://github.com/0xtiki/safeLiza-backend">here</a></b> ✨ 🚀
</p>

## Overview

Welcome to Smart Agent Wallet! This project provides a user-friendly interface for creating and managing Gnosis Safe smart wallets with permissioned access for AI agents. It's designed to make Web3 accessible to everyone, even those with no prior blockchain experience.

Smart Agent Wallet makes it easy to:
- Create secure Gnosis Safe wallets across multiple chains
- Configure fine-grained permissions for automated agents
- Enable AI assistants to execute transactions on your behalf
- Maintain control while delegating specific capabilities

## Purpose

Managing crypto assets can be complex and risky, especially when trying to automate transactions or integrate with AI agents. This frontend solves these challenges by:

1. **Intuitive Wallet Creation**: Simple UI for setting up Gnosis Safe wallets with passkey authentication
2. **Visual Permission Management**: Easy-to-understand interface for creating and managing agent permissions
3. **Seamless Agent Integration**: Connect your favorite AI assistants with just a few clicks
4. **Enhanced Security**: Visual controls for spending limits, time frames, and other safety features
5. **Multi-chain Support**: Manage wallets across different blockchains from a single interface

## Key Features

### Safe Creation and Management
- Multi-chain wallet deployment with a simple interface
- Passkey authentication for enhanced security
- Support for traditional multisig configurations
- Visual dashboard for all your wallets

### Session Configuration
- Interactive policy builder for agent permissions
- Configure policies like:
  - Token-specific spending limits
  - Value limits per transaction
  - Time-based restrictions
  - Action-specific permissions

### Agent Integration
- Endpoint management for AI agent access
- Transaction monitoring and history
- One-click activation/deactivation of agent permissions

### Security
- Passkey-based authentication
- Visual confirmation for all transactions
- Granular permission controls

## Technical Stack

- **Framework**: Next.js 15
- **UI Components**: TailwindCSS with DaisyUI
- **State Management**: React Hooks
- **Blockchain Interaction**: Viem
- **Authentication**: WebAuthn via ox library
- **Module Integration**: Rhinestone Module SDK

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- A modern browser with WebAuthn support

### Installation

```bash
# Clone the repository
git clone https://github.com/0xtiki/smart-agent-wallet-frontend.git

# Install dependencies
cd smart-agent-wallet-frontend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the development server
npm run dev
```

### Configuration

The frontend requires several environment variables:
- `NEXT_PUBLIC_BACKEND_URL`: URL of the backend service

## Usage Flow

1. **Create an Account**: Register with a passkey for secure authentication
2. **Create a Safe**: Deploy a new Safe with passkey or multisig authentication
3. **Configure Sessions**: Create permissioned sessions for agents with specific policies
4. **Activate Endpoints**: Enable secure endpoints for agent access
5. **Monitor Activity**: Track agent transactions and manage permissions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Safe Global](https://safe.global/) for their smart contract wallet infrastructure
- [Rhinestone](https://rhinestone.wtf/) for their module SDK
- [ox](https://github.com/0xsequence/ox) for WebAuthn integration

---

Empower your AI agents with secure wallet access! 🤖💼🔒
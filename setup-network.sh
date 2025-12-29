#!/bin/bash

# Complete Land Registration Network Setup Script
# This script sets up the entire Hyperledger Fabric network with 3 organizations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking prerequisites..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi

    print_status "Prerequisites check passed."
}

# Generate crypto materials and channel artifacts
generate_artifacts() {
    print_header "Generating crypto materials and channel artifacts..."

    cd fabric-samples/test-network

    # Generate crypto materials first
    print_status "Generating crypto materials..."
    cryptogen generate --config=./crypto-config.yaml --output="organizations"

    # Generate genesis block
    print_status "Generating genesis block..."
    configtxgen -profile ThreeOrgsOrdererGenesis -channelID system-channel -outputBlock ./system-genesis-block/genesis.block

    # Generate channel artifacts
    print_status "Generating channel artifacts..."
    configtxgen -profile ThreeOrgsChannel -outputCreateChannelTx ./channel-artifacts/mychannel.tx -channelID mychannel
    configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID mychannel -asOrg Org1MSP
    configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID mychannel -asOrg Org2MSP
    configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org3MSPanchors.tx -channelID mychannel -asOrg Org3MSP

    cd ../..
    print_status "Artifacts generated successfully."
}

# Start the network
start_network() {
    print_header "Starting the Fabric network..."

    cd fabric-samples/test-network
    docker-compose -f docker/docker-compose-full.yaml up -d

    print_status "Waiting for network to be ready..."
    sleep 15

    # Check if all containers are running
    RUNNING=$(docker-compose -f docker/docker-compose-full.yaml ps | grep "Up" | wc -l)
    TOTAL=$(docker-compose -f docker/docker-compose-full.yaml ps | grep -v "Name" | wc -l)

    if [ "$RUNNING" -eq "$TOTAL" ]; then
        print_status "Network started successfully ($RUNNING/$TOTAL containers running)."
    else
        print_error "Some containers failed to start ($RUNNING/$TOTAL running)."
        exit 1
    fi

    cd ../..
}

# Create and join channel
setup_channel() {
    print_header "Setting up channel and joining organizations..."

    # Create channel with Org1
    print_status "Creating channel with Org1..."
    source setOrg1.sh
    createChannel

    # Join Org1 to channel
    print_status "Org1 joining channel..."
    joinChannel
    updateAnchorPeer

    # Join Org2 to channel
    print_status "Org2 joining channel..."
    source setOrg2.sh
    joinChannel
    updateAnchorPeer

    # Join Org3 to channel
    print_status "Org3 joining channel..."
    source setOrg3.sh
    joinChannel
    updateAnchorPeer

    print_status "Channel setup completed."
}

# Setup chaincode
setup_chaincode() {
    print_header "Setting up chaincode..."

    # Package chaincode
    print_status "Packaging chaincode..."
    cd chaincode/land-registration
    npm install
    cd ../..

    # Create tar.gz package
    print_status "Creating chaincode package..."
    peer lifecycle chaincode package chaincode/land-registration.tar.gz \
        --path chaincode/land-registration \
        --lang node \
        --label land-registration_1.0

    # Install on all organizations
    print_status "Installing chaincode on Org1..."
    source setOrg1.sh
    installChaincode

    print_status "Installing chaincode on Org2..."
    source setOrg2.sh
    installChaincode

    print_status "Installing chaincode on Org3..."
    source setOrg3.sh
    installChaincode

    # Approve chaincode
    print_status "Approving chaincode for Org1..."
    source setOrg1.sh
    approveChaincode

    print_status "Approving chaincode for Org2..."
    source setOrg2.sh
    approveChaincode

    print_status "Approving chaincode for Org3..."
    source setOrg3.sh
    approveChaincode

    # Commit chaincode
    print_status "Committing chaincode to channel..."
    source setOrg3.sh
    commitChaincode

    print_status "Chaincode setup completed."
}

# Register users
register_users() {
    print_header "Registering users..."

    cd fabric-samples/test-network
    ./enroll-admins.sh
    cd ../..

    print_status "User registration completed."
}

# Main setup function
main() {
    print_header "=========================================="
    print_header "  Land Registration Network Setup"
    print_header "=========================================="

    check_prerequisites
    generate_artifacts
    start_network
    setup_channel
    setup_chaincode
    register_users

    print_header "=========================================="
    print_status "Network setup completed successfully!"
    print_header "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Start the API server: cd fabric-api && npm start"
    echo "2. Start the client: cd client && npm run dev"
    echo "3. Test the application at http://localhost:3000"
    echo ""
    print_status "Happy coding! 🚀"
}

# Run main function
main "$@"
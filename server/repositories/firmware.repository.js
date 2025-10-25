import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";
const CELO_SEPOLIA_URL = process.env.ALCHEMY_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const ABI = [
  "function publish(string _device_id, string _firmware_version, string _firmware_hash) public",
  "function fetch() public view returns (tuple(address sender, string device_id, string firmware_version, string firmware_hash, uint256 timestamp)[])",
  "function getMessageCount() public view returns (uint256)"
];

const provider = new ethers.JsonRpcProvider(CELO_SEPOLIA_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

export const publishMessage = async (device_id, firmware_version, firmware_hash) => {
  const tx = await contract.publish(device_id, firmware_version, firmware_hash);
  const receipt = await tx.wait();
  return receipt;
};

export const fetchMessages = async () => {
  const messages = await contract.fetch();
  return messages.map((msg) => ({
    sender: msg.sender,
    device_id: msg.device_id,
    firmware_version: msg.firmware_version,
    firmware_hash: msg.firmware_hash,
    timestamp: Number(msg.timestamp),
    date: new Date(Number(msg.timestamp) * 1000).toISOString(),
  }));
};

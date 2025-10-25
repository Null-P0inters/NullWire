import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contract");

  const MessageBoard = await ethers.getContractFactory("MessageBoard");
  const messageBoard = await MessageBoard.deploy();

  await messageBoard.waitForDeployment();

  const address = await messageBoard.getAddress();
  console.log("contract deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const hre = require("hardhat");

async function main() {

  const deployer= await ethers.getSigner();
  console.log("deployer address ", deployer.address);
  console.log("deployer balance ", (await deployer.getBalance())/1e18);

  // ERC20 
  const karbun = await ethers.getContractFactory("Karbun");
  const Karbun = await karbun.deploy();

  await Karbun.deployed();

  console.log("Karbun Token: ", Karbun.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

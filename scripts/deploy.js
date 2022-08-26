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

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

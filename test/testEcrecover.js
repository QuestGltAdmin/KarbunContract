const { expect } = require("chai");
const { ethers, upgrades, network } = require("hardhat");
const { Contract, Signer, BigNumber } = require('ethers')
require('dotenv').config()

const toKBNFracDenomination = (Karbun) =>
  ethers.utils.parseUnits(Karbun, DECIMALS)

const DECIMALS = 18
const INITIAL_SUPPLY = ethers.utils.parseUnits('10',14 + DECIMALS)
const MAX_UINT256 = ethers.BigNumber.from(2).pow(256).sub(1)
const TOTAL_FRACS = MAX_UINT256.sub(MAX_UINT256.mod(INITIAL_SUPPLY))

const transferAmount = toKBNFracDenomination('10')
const unitTokenAmount = toKBNFracDenomination('1')

let accounts = Signer[15],
  deployer = Signer,
  Karbun = Contract,
  initialSupply = BigNumber

async function setupContracts() {
  // prepare signers
  accounts = await ethers.getSigners()
  deployer = accounts[0]
  // deploy upgradable token
  // ERC20 
  const karbun = await ethers.getContractFactory("Karbun");
  const KarbunToken = await karbun.deploy();

  Karbun = await KarbunToken.deployed();

  // fetch initial supply
  initialSupply = await KarbunToken.totalSupply()
}

describe('Karbun', () => {
  before('setup Karbun contract', setupContracts)

  it('should reject any ether sent to it', async function () {
    const user = accounts[1]
    await expect(user.sendTransaction({ to: Karbun.address, value: 1 })).to
      .be.reverted
  })
})

describe('Karbun:Initialization', () => {
  before('setup Karbun contract', setupContracts)

  it('should transfer 10B Karbun to the deployer', async function () {
    expect(await Karbun.balanceOf(await deployer.getAddress())).to.eq(
      INITIAL_SUPPLY,
    )
  })

  it('should set the totalSupply to 10B', async function () {
    expect(await Karbun.totalSupply()).to.eq(INITIAL_SUPPLY)
  })

  it('should set the owner', async function () {
    expect(await Karbun.owner()).to.eq(await deployer.getAddress())
  })

  it('should set detailed ERC20 parameters', async function () {
    expect(await Karbun.name()).to.eq('Karbun')
    expect(await Karbun.symbol()).to.eq('KBN')
    expect(await Karbun.decimals()).to.eq(DECIMALS)
  })
})

describe('Karbun:Transfer', function () {
  let UserA = Signer, UserB = Signer, UserC = Signer, provider = Signer

  before('setup Karbun contract', async () => {
    await setupContracts()
    provider = accounts[9]
    UserA = accounts[10]
    UserB = accounts[11]
    UserC = accounts[12]
  })

  describe('deployer transfers sell', function () {
    it('should have correct balances', async function () {
      const deployerBefore = await Karbun.balanceOf(
        await deployer.getAddress(),
      )
      await Karbun
        .connect(deployer)
        .transfer(await provider.getAddress(), toKBNFracDenomination('10'))
      expect(await Karbun.balanceOf(await deployer.getAddress())).to.eq(
        deployerBefore.sub(toKBNFracDenomination('10')),
      )
      expect(await Karbun.balanceOf(await provider.getAddress())).to.eq(
        toKBNFracDenomination('10'),
      )
    })
  })

  describe('deployer transfers 100 to userA', async function () {
    it('should have correct balances', async function () {
      const deployerBefore = await Karbun.balanceOf(
        await deployer.getAddress(),
      )
      await Karbun
        .connect(deployer)
        .transfer(await UserA.getAddress(), toKBNFracDenomination('100'))
      expect(await Karbun.balanceOf(await deployer.getAddress())).to.eq(
        deployerBefore.sub(toKBNFracDenomination('100')),
      )
      expect(await Karbun.balanceOf(await UserA.getAddress())).to.eq(
        toKBNFracDenomination('100'),
      )
    })
  })

  describe('deployer transfers 200 to userB', async function () {
    it('should have correct balances', async function () {
      const deployerBefore = await Karbun.balanceOf(
        await deployer.getAddress(),
      )

      await Karbun
        .connect(deployer)
        .transfer(await UserB.getAddress(), toKBNFracDenomination('200'))
      expect(await Karbun.balanceOf(await deployer.getAddress())).to.eq(
        deployerBefore.sub(toKBNFracDenomination('200')),
      )
      expect(await Karbun.balanceOf(await UserB.getAddress())).to.eq(
        toKBNFracDenomination('200'),
      )
    })
  })

  describe('deployer transfers 100 Buy fees', function () {
    it('should have correct balances', async function () {
      const deployerBefore = await Karbun.balanceOf(
        await deployer.getAddress(),
      )
      const providerBefore = await Karbun.balanceOf(
        await provider.getAddress(),
      )
      await Karbun
        .connect(provider)
        .transfer(await deployer.getAddress(), toKBNFracDenomination('1'))
      expect(await Karbun.balanceOf(await provider.getAddress())).to.eq(
        providerBefore.sub(toKBNFracDenomination('1')),
      )
      expect(await Karbun.balanceOf(await deployer.getAddress())).to.eq(
        deployerBefore.add(toKBNFracDenomination('1')),
      )
    })
  })
})

describe('Karbun:Mint', async () => {
  let user = Signer
  let balanceOfUserBefore;
  let TotalSupply;

  before('setup Karbun contract', async () => {
    await setupContracts()
    user = accounts[2]
  })

  it('should be callable by owner', async function () {
    balanceOfUserBefore = await Karbun.balanceOf(user.address);
    TotalSupply = await Karbun.totalSupply();
  })
  it('should be callable by deployer', async function () {
    await expect(Karbun.connect(deployer).mint(user.address, 10000000000))
      .to.not.be.reverted
  })
  it('should not be callable by any other', async function () {
    await expect(Karbun.connect(user).mint(user.address, 10000000000))
      .to.be.reverted
  })
  it('Balance will be increased by 10000000000', async function () {
    const ExpectedtotalBalance = balanceOfUserBefore.add(10000000000);
    const BalanceOf = await Karbun.balanceOf(user.address);
    expect(BalanceOf).to.be.equal(ExpectedtotalBalance);
  })
  it('Totalsupply will be increased by 10000000000', async function () {
    const ExpectedTotalSupply = TotalSupply.add(10000000000);
    const TotalSup = await Karbun.totalSupply();
    expect(TotalSup).to.be.equal(ExpectedTotalSupply);
  })
})

describe('Karbun:Burn', async () => {
  let user = Signer
  let balanceOfUserBefore;
  let TotalSupply;

  before('setup Karbun contract', async () => {
    await setupContracts()
    user = accounts[2]

  })

  it('should be callable by owner', async function () {
    balanceOfUserBefore = await Karbun.balanceOf(deployer.address);
    TotalSupply = await Karbun.totalSupply();
  })
  it('should be callable by deployer', async function () {
    await expect(Karbun.connect(deployer).burn(deployer.address, 10000000000))
      .to.not.be.reverted
  })
  it('can not burn more then balance', async function () {
    await expect(Karbun.connect(user).burn(user.address, 10000000000))
      .to.be.reverted
  })
  it('Balance will be decreased by 10000000000', async function () {
    const ExpectedtotalBalance = balanceOfUserBefore.sub(10000000000);
    const BalanceOf = await Karbun.balanceOf(deployer.address);
    expect(BalanceOf).to.be.equal(ExpectedtotalBalance);
  })
  it('Totalsupply will be decreased by 10000000000', async function () {
    const ExpectedTotalSupply = TotalSupply.sub(10000000000);
    const TotalSup = await Karbun.totalSupply();
    expect(TotalSup).to.be.equal(ExpectedTotalSupply);
  })
})
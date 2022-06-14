require("@nomiclabs/hardhat-waffle");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const provider = waffle.provider;

describe("deploy and test TestMedallion", function () {
  let TestMedallion;
  let testMedallion;  
  it("Successful deployment of TestMedallionAnyAddressMintA", async function () {
    TestMedallion = await ethers.getContractFactory("TestMedallionAnyAddressMintA");
    testMedallion = await TestMedallion.deploy();
    await testMedallion.deployed();    
  });

  it("Testing minting", async function () {
    const [owner, addr2, addr3] = await ethers.getSigners();
    await expect(testMedallion.mint(3)).to.not.be.reverted;
    await expect(testMedallion.mint(3)).to.not.be.reverted;
    await expect(testMedallion.mint(5)).to.be.reverted; // too many (only 10 available: 3+3+5==11)
    await expect(testMedallion.connect(addr2).mint(2)).to.be.reverted; // non-owner address must send cash
    let eth = ethers.BigNumber.from("100000000000000000"); // (0.5 Eth x 2 tokens)
    await expect(testMedallion.connect(addr2).mint(2, {from: addr2.address, value: eth})).to.not.be.reverted;

    /* kinda dumb for the contract owner to send $$ to buy a token since they are free for the
     * owner in this particular case. However, we'll test it anyway. */
    await expect(testMedallion.mint(2, {from: owner.address, value: eth})).to.not.be.reverted; 
    
    // NFT balances
    let x = await testMedallion.balanceOf(owner.address);
    expect(x).to.equal(8);
    x = await testMedallion.balanceOf(addr2.address);
    expect(x).to.equal(2);    
    
    // owners of various NFTs
    x = await testMedallion.ownerOf(1);
    expect(x).to.equal(owner.address);
    x = await testMedallion.ownerOf(4);
    expect(x).to.equal(owner.address);
    x = await testMedallion.ownerOf(7);
    expect(x).to.equal(addr2.address);
    x = await testMedallion.ownerOf(10);
    expect(x).to.equal(owner.address);
    await expect(testMedallion.ownerOf(11)).to.be.reverted; // there is no 11
  });
  it("Testing Eth balance and withdrawl after minting", async function () {
    const [owner, addr2, addr3] = await ethers.getSigners();    
    let contr = await testMedallion.address;
    let beginContractBal = await provider.getBalance(contr);
    eth = ethers.BigNumber.from("200000000000000000"); // (0.5 Eth x 2 tokens) x 2 mints
    expect(beginContractBal.eq(eth)).to.equal(true); 

    let beginOwnerBal = await provider.getBalance(owner.address);
    // attempt to withdraw to non-owner account should fail
    await expect(testMedallion.connect(addr2).withdraw()).to.be.reverted;
    let afterContractBal = await provider.getBalance(contr);
    expect(afterContractBal.eq(eth)).to.equal(true);
    // owner attempt to withdraw should succeed 
    await expect(testMedallion.withdraw()).to.not.be.reverted;
    afterContractBal = await provider.getBalance(contr);
    expect(afterContractBal.isZero()).to.equal(true);
    let afterOwnerBal = await provider.getBalance(owner.address);
    /* IMPORTANT: because the owner is paying for the Tx's, the owner balance will not = (afterOwnerBal + eth),
     * it will instead = (afterOwnerBal + eth) - gas. Therefore, we will check for greaterThan, not equal to. 
     * This is done using the ether's BigNumber comparison 'gt'. See https://docs.ethers.io/v5/api/utils/bignumber/. */
    let gtrThan = afterOwnerBal.gt(beginOwnerBal);
    expect(gtrThan).to.equal(true);    
  });
});
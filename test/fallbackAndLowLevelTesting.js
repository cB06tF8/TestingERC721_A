//require("@nomiclabs/hardhat-waffle");
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

  it("Test simple mint", async function () {
    await expect(testMedallion.mint(1)).to.not.be.reverted;
  });

  it("Test fallback, receive and non-self destruction", async function () {
    const [owner, addr2, addr3] = await ethers.getSigners();
    let amount = ethers.BigNumber.from("100000000000000000"); 
    let tx = {
      to: testMedallion.address,
      value: amount
    };  
    await expect(owner.sendTransaction(tx)).to.not.be.reverted;
    let contr = await testMedallion.address;
    let contractBal = await provider.getBalance(contr);    
    expect(contractBal.eq(amount)).to.equal(true);
    // 'theData' is the function signature for minting 1 token
    let theData = "0xa0712d680000000000000000000000000000000000000000000000000000000000000001";
    tx = {
      to: testMedallion.address,
      data: theData
    };  
    await expect(owner.sendTransaction(tx)).to.not.be.reverted;
    // sending eth and data
    tx = {
      to: testMedallion.address,
      value: amount,
      data: theData
    };
    await expect(owner.sendTransaction(tx)).to.not.be.reverted;
    let x = await testMedallion.balanceOf(owner.address);
    // IMPORTANT: sending data into the fallback and receive functions has minted 2 more tokens
    expect(x).to.equal(ethers.BigNumber.from("3"));
  });

  it("Test low level calls", async function () {
    const [owner, addr2, addr3] = await ethers.getSigners();
    // test to ensure it cannot self destruct
    /*
    let amount = ethers.BigNumber.from("100000000000000000"); 
    let tx = {
      to: testMedallion.address,
      value: amount
    };  
    await expect(owner.sendTransaction(tx)).to.not.be.reverted;
    let contr = await testMedallion.address;
    let contractBal = await provider.getBalance(contr);    
    expect(contractBal.eq(amount)).to.equal(true);
*/
    //let dataStr = web3.eth.abi.encodeParameter('string', 'Hello');
    /*tx = {
      to: testMedallion.address,
      calldata: "0x123"
    };  
    await expect(owner.sendTransaction(tx)).to.not.be.reverted;
    */
  });
});
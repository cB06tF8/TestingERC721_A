require("@nomiclabs/hardhat-waffle");
const { expect } = require("chai");
const { ethers } = require("hardhat");

/* These testing scripts make sure basic configurations can only be set from the
 * owner of the contract.   */
describe("Test changing configuration of TestMedallion", function () {
  let TestMedallion;
  let testMedallion;
  it("Successful deployment of TestMedallionAnyAddressMintA", async function () {
    TestMedallion = await ethers.getContractFactory("TestMedallionAnyAddressMintA");
    testMedallion = await TestMedallion.deploy();
    await testMedallion.deployed();
  });
  it("Contract owner changes 'paused' param of TestMedallionAnyAddressMintA", async function () {
    const [owner, addr2, addr3] = await ethers.getSigners();
    await testMedallion.pause();
    let x = await testMedallion.paused();
    expect(x).to.equal(true);
    await expect(testMedallion.mint(2)).to.be.reverted;
    await testMedallion.unpause();
    x = await testMedallion.paused();
    expect(x).to.equal(false);
    await expect(testMedallion.mint(2)).to.not.be.reverted;
    // a double-check of owner address balance
    //x = await testMedallion.balanceOf(owner.address);    
  });
  it("Contract owner changes 'baseURI' and 'cost' params of TestMedallionAnyAddressMintA", async function () {
    const [owner, addr2, addr3] = await ethers.getSigners();
    let beginVal = await testMedallion.baseURI();
    await testMedallion.setBaseURI("1234abc");
    let x = await testMedallion.baseURI();
    expect(x).to.equal("1234abc");
    await testMedallion.setBaseURI(beginVal);
    x = await testMedallion.baseURI();
    expect(x).to.equal(beginVal);
    
    beginVal = await testMedallion.cost();
    await testMedallion.setCost(150);
    x = await testMedallion.cost();
    expect(x).to.equal(150);
    await testMedallion.setCost(beginVal);
    x = await testMedallion.cost();
    expect(x).to.equal(beginVal);
  });
  it("Contract owner transfers ownership TestMedallionAnyAddressMintA", async function () {
    const [owner, addr2, addr3] = await ethers.getSigners();
    let beginVal = await testMedallion.owner();
    await expect(testMedallion.transferOwnership(addr2.address)).to.not.be.reverted;
    let x = await testMedallion.owner();
    expect(x).to.not.equal(beginVal);
  });
  it("Non-contract owner cannot change configurations in TestMedallionAnyAddressMintA", async function () {
    const [owner, addr2, addr3] = await ethers.getSigners();
    // ownership has passed from the original owner
    await expect(testMedallion.pause()).to.be.reverted;
    await expect(testMedallion.setBaseURI("1234abc")).to.be.reverted;
    await expect(testMedallion.setCost(150)).to.be.reverted;
    await expect(testMedallion.transferOwnership(owner.address)).to.be.reverted;    
    // switch back to original owner
    await expect(testMedallion.connect(addr2).transferOwnership(owner.address)).to.not.be.reverted;
  });
  
  /* IMPORTANT: only uncomment for testing a contract locally as it is permanent
  it("Renounce ownership of TestMedallionAnyAddressMintA", async function () {
    await expect(testMedallion.renounceOwnership()).to.not.be.reverted;
    x = await testMedallion.owner();
    expect(x).to.equal("0x0000000000000000000000000000000000000000");
  });
  */

});

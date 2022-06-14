//require("@nomiclabs/hardhat-waffle");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("deploy and test TestMedallion", function () {
  let TestMedallion;
  let testMedallion;
  it("Successful deployment of TestMedallionAnyAddressMintA", async function () {
    TestMedallion = await ethers.getContractFactory("TestMedallionAnyAddressMintA");
    testMedallion = await TestMedallion.deploy();
    await testMedallion.deployed();
    const maxSupply = await testMedallion.maxSupply();
    expect(maxSupply).to.equal(10);      
  });

  it("Basic Testing of TestMedallionAnyAddressMintA", async function () {
    const [owner, addr2, addr3] = await ethers.getSigners();
    let x = await testMedallion.cost();
    x = x.toString();
    expect(x).to.equal("50000000000000000");
    x = await testMedallion.baseURI();
    expect(x).to.equal("ipfs://QmYZKposdkySD5muWZnHzCqcLm6VXM2UKg6v5QLJaz12Ze/");
    x = await testMedallion.baseExtension();
    expect(x).to.equal(".json");
    x = await testMedallion.name();
    expect(x).to.equal("TestMedallionAnyAddressMintA");
    x = await testMedallion.maxSupply();
    expect(x).to.equal(10);
    x = await testMedallion.symbol();
    expect(x).to.equal("TMEDAMA");
    x = await testMedallion.owner();
    expect(x).to.equal("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    x = await testMedallion.paused();
    expect(x).to.equal(false);
  });
});

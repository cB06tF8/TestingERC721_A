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

  it("Test tokenURIs, approvals and transfers", async function () {
    const [owner, addr2, addr3] = await ethers.getSigners();
    // will need to actually replace the openSea gateway placeHolder with the a real IPFS gateway
    const baseURI = "ipfs://QmYZKposdkySD5muWZnHzCqcLm6VXM2UKg6v5QLJaz12Ze/";
    const placeHolder = "ipfs://";
    const gateway = "https://gateway.pinata.cloud/ipfs/";
    await expect(testMedallion.mint(10)).to.not.be.reverted;

    // check each tokenURI and print to console the URI using the Pinata gateway
    let x = await testMedallion.tokenURI(ethers.BigNumber.from("1"));
    expect(x).to.equal(baseURI + "1.json");
    x = await testMedallion.tokenURI(ethers.BigNumber.from("2"));
    expect(x).to.equal(baseURI + "2.json");
    x = await testMedallion.tokenURI(ethers.BigNumber.from("3"));
    expect(x).to.equal(baseURI + "3.json");
    x = await testMedallion.tokenURI(ethers.BigNumber.from("4"));
    expect(x).to.equal(baseURI + "4.json");
    x = await testMedallion.tokenURI(ethers.BigNumber.from("5"));
    expect(x).to.equal(baseURI + "5.json");
    x = await testMedallion.tokenURI(ethers.BigNumber.from("6"));
    expect(x).to.equal(baseURI + "6.json");
    x = await testMedallion.tokenURI(ethers.BigNumber.from("7"));
    expect(x).to.equal(baseURI + "7.json");
    x = await testMedallion.tokenURI(ethers.BigNumber.from("8"));
    expect(x).to.equal(baseURI + "8.json");
    x = await testMedallion.tokenURI(ethers.BigNumber.from("9"));
    expect(x).to.equal(baseURI + "9.json");
    const lastToken = await testMedallion.tokenURI(ethers.BigNumber.from("10"));
    expect(lastToken).to.equal(baseURI + "10.json");

    await expect(testMedallion.transferFrom(owner.address, addr2.address, 3)).to.not.be.reverted;
    x = await testMedallion.ownerOf(3);
    await expect(x).to.equal(addr2.address);
    await expect(testMedallion.transferFrom(owner.address, addr2.address, 11)).to.be.reverted; // non-existant token
    await expect(testMedallion.connect(addr2).transferFrom(owner.address, addr2.address, 4)).to.be.reverted;
    await expect(testMedallion.transferFrom(owner.address, addr2.address, 3)).to.be.reverted; // not owner's token

    /* IMPORTANT: Overloaded methods (like safeTransferFrom) need to be called by specifying the function signature.
     * see https://stackoverflow.com/questions/68289806/no-safetransferfrom-function-in-ethers-js-contract-instance
     * example: contract["safeTransferFrom(address,address,uint256)"](addr1, addr2, 1); */
    await expect(testMedallion["safeTransferFrom(address,address,uint256)"](owner.address, addr2.address, 4)).to.not.be.reverted;
    x = await testMedallion.ownerOf(4);
    expect(x).to.equal(addr2.address);

    const str = "hello world!";
    const encoder = new TextEncoder();
    let byteStr = encoder.encode(str); 
    await expect(testMedallion["safeTransferFrom(address,address,uint256,bytes)"](owner.address, addr2.address, 5, byteStr)).to.not.be.reverted;
    x = await testMedallion.ownerOf(5);
    expect(x).to.equal(addr2.address);

    // IMPORTANT: as of now in the testing, addr2 is the owner of 3,4,5 because of transfers
    await expect(testMedallion.connect(addr2).approve(owner.address, 3)).to.not.be.reverted;
    x = await testMedallion.getApproved(3);
    expect(x).to.equal(owner.address);
    // interestingly, addr2 is not "approved" here. also note that only 1 address seems to be able to be approved at a time
    await expect(testMedallion.transferFrom(owner.address, addr3.address, 3)).to.be.reverted; // not the owner    
    await expect(testMedallion.transferFrom(addr2.address, addr3.address, 3)).to.not.be.reverted;
    x = await testMedallion.ownerOf(3);
    await expect(x).to.equal(addr3.address);
    // note that the approval only lasts 1 Tx, then the approval is gone
    await expect(testMedallion.transferFrom(addr3.address, addr2.address, 3)).to.be.reverted;
    x = await testMedallion.ownerOf(3);
    await expect(x).to.equal(addr3.address);

    await expect(testMedallion.connect(addr2).setApprovalForAll(owner.address, true)).to.not.be.reverted;
    x = await testMedallion.isApprovedForAll(addr2.address, owner.address);
    expect(x).to.equal(true);

    await expect(testMedallion.transferFrom(addr2.address, addr3.address, 4)).to.not.be.reverted;
    x = await testMedallion.ownerOf(4);
    expect(x).to.equal(addr3.address);
    await expect(testMedallion.transferFrom(addr2.address, addr3.address, 5)).to.not.be.reverted;
    x = await testMedallion.ownerOf(5);
    expect(x).to.equal(addr3.address);

    x = await testMedallion.isApprovedForAll(addr2.address, owner.address);
    expect(x).to.equal(true); // still set to true even though addr2 has no balance
    await expect(testMedallion.connect(addr2).setApprovalForAll(owner.address, false)).to.not.be.reverted;
    x = await testMedallion.isApprovedForAll(addr2.address, owner.address);
    expect(x).to.equal(false);

    // for console display
    console.log("\nCut and paste Token URI into browser as final After Minting test");
    console.log("tokenURI(10):\n    " + lastToken);    
    console.log("\ntokenURI(10) with gateway:\n    " + lastToken.replace(placeHolder, gateway));
  });
});
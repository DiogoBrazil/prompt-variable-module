const { it, describe, before } = require("mocha");
const { faker } = require("@faker-js/faker");
const expect = require("chai").expect;
const sinon = require("sinon");

const PromptVariablesModule = require("../../../FiboAgentHub/PromptVariables");

describe("PromptVariables", function () {

    let prompt;
    let url, method;
    before(function () {
        prompt = `${faker.lorem.sentence()} £{variable-1}. ${faker.lorem.sentence()} £{variable-2} ${faker.lorem.sentence()}. £{variable-3}.`;

        url = faker.internet.url();
        method = "GET";
    });

    describe("extractVariables", function () {

        it("it must extract all variables that are determined by £{}", function () {
            const result = PromptVariablesModule.extractVariables(prompt);

            expect(result).to.have.lengthOf(3);
            expect(result[0][0]).to.be.eql("£{variable-1}");
            expect(result[0][1]).to.be.eql("variable-1");

            expect(result[1][0]).to.be.eql("£{variable-2}");
            expect(result[1][1]).to.be.eql("variable-2");

            expect(result[2][0]).to.be.eql("£{variable-3}");
            expect(result[2][1]).to.be.eql("variable-3");
        });

    });

    describe("mountVariables", function () {

        it("it must mount an array with variables", function () {
            const extractedVariables = PromptVariablesModule.extractVariables(prompt);

            const result = PromptVariablesModule.mountVariables(extractedVariables);

            expect(result).to.have.lengthOf(3);
            expect(result).to.be.eql(["variable-1", "variable-2", "variable-3"]);
        });

    });

    describe("getVariablesValues", function () {

        it("it must return ", async function () {
            const variableValue = faker.lorem.sentence();

            const requestMock = sinon.stub().callsFake(async function () {
                return variableValue;
            });

            const variables = ["variable-1", "variable-2", "variable-3"];

            const result = await PromptVariablesModule.getVariablesValues(
                faker.internet.userName(),
                faker.database.mongodbObjectId(),
                variables,
                requestMock
            );

            expect(result).to.have.lengthOf(3);
            expect(result[0]).to.be.eql(variableValue);
            expect(result[1]).to.be.eql(variableValue);
            expect(result[2]).to.be.eql(variableValue);
        });

    });

    describe("mountUrl", function () {

        it("it must mount url with successfully", function () {
            const user = faker.internet.userName();
            const conversation = faker.database.mongodbObjectId();
            const name = faker.name.firstName();

            const result = PromptVariablesModule.mountUrl(user, conversation, name);

            expect(result).to.be.eql(`http://localhost:3000/api/variables/${user}/${conversation}/${name}`);
        });

    });

    describe("request", function () {

        it("it must have successfully on request", async function () {
            const variableValue = faker.lorem.sentence();
            const axiosLibMock = sinon.stub().callsFake(async function () {
                return {data: {value: variableValue}};
            });

            const result = await PromptVariablesModule.request(url, method, undefined, axiosLibMock);

            expect(result).to.be.eql(variableValue);
        });

        it("it must throw an error on request", async function () {
            const axiosLibMock = sinon.stub().callsFake(async function () {
                throw new Error();
            });

            const result = await PromptVariablesModule.request(url, method, undefined, axiosLibMock);

            expect(result).to.be.eql("default");
        });

    });

    describe("mountPhraseToGptResponse", function () {

        it("it must replace the variables by your values", function () {
            const responses = ["programming", "language", "c++"];
            const extractedVariables = PromptVariablesModule.extractVariables(prompt);

            const result = PromptVariablesModule.mountPhraseToGptResponse(responses, extractedVariables, prompt);

            expect(result.includes("£{variable-1}")).to.be.false;
            expect(result.includes("£{variable-2}")).to.be.false;
            expect(result.includes("£{variable-3}")).to.be.false;

            expect(result.includes("programming")).to.be.true;
            expect(result.includes("language")).to.be.true;
            expect(result.includes("c++")).to.be.true;
        });

    });

});
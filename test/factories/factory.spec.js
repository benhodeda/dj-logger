const _ = require('lodash');
const chai = require('chai');
chai.should();

const Factory = require('../../factories/factory');
let factory;

describe('Factory tests', () => {

    describe('constructor', () => {

        it("Initialize Factory instance's collection property with input data " +
            "when initialize new instance with parameter", () => {
            //arrange
            const data = {test: 6};

            //act
            factory = new Factory(data);

            //assert
            factory.collection.should.be.deep.equal(data);
        });

        it("Initialize Factory instance's collection property with empty object " +
            "when initialize new instance without parameters", () => {
            //arrange
            const expectedValue = {};

            //act
            factory = new Factory();

            //assert
            factory.collection.should.be.deep.equal(expectedValue);
        });

    });

    describe('get', () => {

        before(() => {
            factory = new Factory({test: 6});
        });

        it("return value from instance's collection without changing the collection " +
            "when getting it's key as first value", () => {
            //arrange
            const key = "test";
            const expectedValue = 6;
            const expectedCollection = _.clone(factory.collection);

            //act
            const result = factory.get(key);

            //assert
            result.should.be.deep.equal(expectedValue);
            factory.collection.should.be.deep.equal(expectedCollection);
        });

        it("return the second parameter " +
            "and add the instance's collection property the get's first parameter lower csed as key " +
            "with value equal to the second parameter " +
            "when the first parameter isn't key in the instance's collection property ans the second parameter is an object", () => {
            //arrange
            const key = "notExistKey";
            const value = {my: "value"};
            const expectedKey = key.toLowerCase();

            //act
            let result = factory.get(key, value);

            //assert
            result.should.be.deep.equal(value);
            factory.collection.should.have.property(expectedKey, value);
        });

        it("return the second parameter as required module " +
            "and add the instance's collection property the get's first parameter lower csed as key " +
            "with value equal to the second parameter as required module " +
            "when the first parameter isn't key in the instance's collection property ans the second parameter module name", () => {
            //arrange
            const key = "moduleKey";
            const value = 'lodash';
            const expectedKey = key.toLowerCase();

            //act
            let result = factory.get(key, value);

            //assert
            result.should.be.deep.equal(_);
            factory.collection.should.have.property(expectedKey, _);
        });

    });

});
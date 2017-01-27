const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const ContinuationLocalStorageMock = require('../../mocks/node_modules/continuation-local-storage.mock');
const StorageMock = require('../../mocks/node_modules/storage.mock');
const uuidMock = require('../../mocks/node_modules/node-uuid.mock');
const Parameters = require('../../models/parameters');

const storageMock = new StorageMock();
const clsMock = new ContinuationLocalStorageMock(storageMock);
const parameters = new Parameters(clsMock, uuidMock);

let storageSpy;

const TID_KEY = "tid";

describe('parameters tests', () => {

    beforeEach(() => {
        storageSpy = {
            set: sinon.spy(storageMock, "set"),
            get: sinon.spy(storageMock, "get")
        }
    });

    afterEach(() => {
        storageSpy.set.restore();
        storageSpy.get.restore();
    });

    describe('setTransactionId', () => {

        it("will save an input transaction id " +
            "when setTransactionId call with an input", () => {
            //arrange
            const tid = "my tid";

            //act
            parameters.setTransactionId(tid);

            //assert
            assert(storageSpy.set.withArgs(TID_KEY, tid).calledOnce, `setTransactionId did not set ${TID_KEY} with value "${tid}" as expected`)
        });

        it("will save uuid's v4 method's result as transaction id " +
            "when setTransactionId call without an input", () => {
            //arrange
            const tid = uuidMock.v4();

            //act
            parameters.setTransactionId();

            //assert
            assert(storageSpy.set.withArgs(TID_KEY, tid).calledOnce, `setTransactionId did not set ${TID_KEY} with value "${tid}" as expected`)
        });

    });

    describe('getTransactionId', () => {

        it("will save an input transaction id " +
            "when setTransactionId call with an input", () => {
            //arrange
            const tid = "my tid";

            //act
            parameters.setTransactionId(tid);

            //assert
            assert(storageSpy.set.withArgs(TID_KEY, tid).calledOnce, `setTransactionId did not set ${TID_KEY} with value "${tid}" as expected`)
        });

        it("will save uuid's v4 method's result as transaction id " +
            "when setTransactionId call without an input", () => {
            //arrange
            const tid = uuidMock.v4();

            //act
            parameters.setTransactionId();

            //assert
            assert(storageSpy.set.withArgs(TID_KEY, tid).calledOnce, `setTransactionId did not set ${TID_KEY} with value "${tid}" as expected`)
        });

    });

});
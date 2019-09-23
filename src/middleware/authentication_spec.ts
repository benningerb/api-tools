import { evaluateAuthenticatedContext } from './authentication';
import { IHaveToken } from './authorization';
import { IHaveDecodedToken } from './authentication';
import { IMinimalKoaCtx } from '../helpers/minimalKoaCtx';
import { IHaveCorrelationId } from './requestId';
import { createLogger } from '../utils/logger';
import * as idService from '../services/idm';
import Boom from '@hapi/boom';

describe('.evaluateAuthenticatedContext', () => {
    const mockLogger = createLogger({
        appName: 'MockAppName',
        logLevel: 'info',
        prettyPrintLogs: false,
        useRawConsoleLogger: false,
    });
    const spyOfDecodeAccessToken = jest.spyOn(idService, 'decodeAccessToken');
    const mockClientId = 'mockClientId';
    let evaluateAuthenticatedContextMiddleware: <T extends IMinimalKoaCtx & IHaveToken & IHaveCorrelationId>(ctx: T) => Promise<T & IHaveDecodedToken>;

    beforeEach(() => {
        evaluateAuthenticatedContextMiddleware = evaluateAuthenticatedContext({ clientWhitelist: [mockClientId], logger: mockLogger });
        spyOfDecodeAccessToken.mockReset();
    });

    it('should house the decoded token on the newly created ctx', async () => {
        // Arrange
        const expectedToken: idService.IAccessTokenDecoded = {
            client_id: mockClientId,
            flid: 'mockFlId1',
            sub: 'mockSubId1',
            access_token: 'mockAccessToken04j50jty50jy50j',
        };
        spyOfDecodeAccessToken.mockResolvedValue(expectedToken);

        const newCtx = await evaluateAuthenticatedContextMiddleware({
            state: {
                accessToken: 'mockAccessToken',
            },
            bearerToken: expectedToken.access_token,
            correlationId: 'mockCorrelationId',
        });

        expect(newCtx.decodedToken).toEqual(expectedToken);
    });

    it('should throw if the token is not found', async () => {
        // Arrange
        const expectedToken: idService.IAccessTokenDecoded = {
            client_id: mockClientId,
            flid: 'mockFlId1',
            sub: 'mockSubId1',
            access_token: 'mockAccessToken04j50jty50jy50j',
        };
        // ACT
        let errorToValidate: Error | null = null;
        try {
            await evaluateAuthenticatedContextMiddleware({
                state: {},
                bearerToken: expectedToken.access_token,
                correlationId: 'mockCorrelationId',
            });
        } catch (err) {
            errorToValidate = err;
        }

        // Assert
        expect(errorToValidate).toEqual(Boom.badRequest('No token found!'));
    });

    it('should throw if the token decode api rejects', async () => {
        // Arrange
        const fakeIdmErrorBody = {
            message: "I am the IDM server and I don't like the token!",
        };
        spyOfDecodeAccessToken.mockRejectedValue(fakeIdmErrorBody);

        // ACT
        let errorToValidate: Error | null = null;
        try {
            await evaluateAuthenticatedContextMiddleware({
                state: {
                    accessToken: 'mockAccessToken',
                },
                bearerToken: 'some token that wont be valid',
                correlationId: 'mockCorrelationId',
            });
        } catch (err) {
            errorToValidate = err;
        }

        // Assert
        expect(errorToValidate).toEqual(Boom.unauthorized(fakeIdmErrorBody.message));
    });
});
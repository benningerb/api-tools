import { evaluateAuthenticatedContext } from './authentication';
import { envVars } from '../config/env';
import * as idService from '../services/idm';
import Boom from '@hapi/boom';

describe('.evaluateAuthenticatedContext', () => {
    const spyOfDecodeAccessToken = jest.spyOn(idService, 'decodeAccessToken');

    beforeEach(() => {
        spyOfDecodeAccessToken.mockReset();
    });

    it('should house the decoded token on the newly created ctx', async () => {
        // Arrange
        const expectedToken: idService.IAccessTokenDecoded = {
            client_id: envVars.get('IDM_CLIENT_ID'),
            flid: 'mockFlId1',
            sub: 'mockSubId1',
            access_token: 'mockAccessToken04j50jty50jy50j',
        };
        spyOfDecodeAccessToken.mockResolvedValue(expectedToken);

        const newCtx = await evaluateAuthenticatedContext({
            state: {
                accessToken: 'mockAccessToken',
            },
            bearerToken: expectedToken.access_token,
            correlationId: 'mockCorrelationId',
        });

        expect(newCtx.decodedToken).toEqual(expectedToken);
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
            await evaluateAuthenticatedContext({
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
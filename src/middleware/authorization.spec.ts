import * as authorizationMiddleware from './authorization';
import Boom from '@hapi/boom';
import { envVars } from '../config/env';
import * as idService from '../services/idm';

describe('.ensureBearerTokenMiddleware', () => {
    let ctx: any;
    const spyOfDecodeToken = jest.spyOn(idService, 'decodeAccessToken');

    beforeEach(() => {
        ctx = {
            status: 200,
        } as any;

        spyOfDecodeToken.mockReset();
    });

    afterEach(() => { });

    it('should throw a unauthorized error if there is no Authorization header and no token query param', async () => {
        // Arrange
        ctx.headers = {};
        ctx.query = {};

        // ACT
        let errorToValidate: Error | null = null;
        try {
            const next = async () => 'middleware finished';
            await authorizationMiddleware.ensureBearerTokenMiddleware(ctx, next);
        } catch (err) {
            errorToValidate = err;
        }

        // Assert
        expect(errorToValidate).toEqual(Boom.unauthorized('Could not find an Authorization header'));
    });

    it('should throw a unauthorized error if Authorization header value does not start with bearer', async () => {
        // Arrange
        ctx.headers = {
            Authorization: '',
        };
        ctx.query = {};

        // ACT
        let errorToValidate: Error | null = null;
        try {
            const next = async () => 'middleware finished';
            await authorizationMiddleware.ensureBearerTokenMiddleware(ctx, next);
        } catch (err) {
            errorToValidate = err;
        }

        // Assert
        expect(errorToValidate).toEqual(Boom.unauthorized('Could not find an Authorization header value'));
    });

    it('should throw a unauthorized error if Authorization header value DOES start with bearer but is missing the actual token', async () => {
        // Arrange
        ctx.headers = {
            Authorization: 'bearer ',
        };
        ctx.query = {};

        // ACT
        let errorToValidate: Error | null = null;
        try {
            const next = async () => 'middleware finished';
            await authorizationMiddleware.ensureBearerTokenMiddleware(ctx, next);
        } catch (err) {
            errorToValidate = err;
        }

        // Assert
        expect(errorToValidate).toEqual(
            Boom.unauthorized('Authorization bearer token not provided or in incorrect format'),
        );
    });

    it('should not throw if the decodedToken endpoint accepts the auth header value', async () => {
        // Arrange
        ctx.headers = {
            Authorization: 'bearer 123409834094',
        };
        ctx.query = {};
        spyOfDecodeToken.mockResolvedValue({
            access_token: 'mock access_token',
            client_id: envVars.get('IDM_CLIENT_ID'),
            sub: 'mockSubId',
        });

        // ACT
        let errorToValidate: Error | null = null;
        try {
            const next = async () => 'middleware finished';
            await authorizationMiddleware.ensureBearerTokenMiddleware(ctx, next);
        } catch (err) {
            errorToValidate = err;
        }

        // Assert
        expect(errorToValidate).toEqual(null);
    });

    it('should not throw if the decodedToken endpoint accepts the token query value', async () => {
        // Arrange
        ctx.headers = {};
        ctx.query = {
            token: '123409834094'
        };
        spyOfDecodeToken.mockResolvedValue({
            access_token: 'mock access_token',
            client_id: envVars.get('IDM_CLIENT_ID'),
            sub: 'mockSubId',
        });

        // ACT
        let errorToValidate: Error | null = null;
        try {
            const next = async () => 'middleware finished';
            await authorizationMiddleware.ensureBearerTokenMiddleware(ctx, next);
        } catch (err) {
            errorToValidate = err;
        }

        // Assert
        expect(errorToValidate).toEqual(null);
    });
});
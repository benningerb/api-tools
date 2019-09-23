import Router from 'koa-router';
import { Context } from 'koa';
import shortId from 'shortid';
import * as requestId from './requestId';

describe('ctxHelpers', () => {
    describe('.insertCorrelationId', () => {
        let insertCorrelationIdMiddleware: Router.IMiddleware;

        beforeEach(() => {
            insertCorrelationIdMiddleware = requestId.insertCorrelationId();
        })

        it('should resolve having called addCorrelationIdToCtx', async () => {
            const spyOfAddCorrelationIdToCtx = jest.spyOn(requestId, 'addCorrelationIdToCtx');
            const mockContext = {} as any;
            await insertCorrelationIdMiddleware(mockContext, () => Promise.resolve());
            expect(spyOfAddCorrelationIdToCtx.mock.calls.length).toBe(1);
        });
    });

    describe('.addCorrelationIdToCtx', () => {
        it('should generate a correlation ID', () => {
            const spyOfShortIdGenerate = jest.spyOn(shortId, 'generate');
            const mockCorrelationId = '12345';
            const mockCtx = {} as Context;
            spyOfShortIdGenerate.mockReturnValue(mockCorrelationId);
            expect(requestId.addCorrelationIdToCtx(mockCtx)).toEqual({ correlationId: mockCorrelationId });
            spyOfShortIdGenerate.mockReset();
        });

        it('should use correlation ID from header', () => {
            const mockCorrelationId = '12345';
            const mockCtx = {
                headers: {
                    'x-fl-hop-correlationid': mockCorrelationId
                }
            } as Context;
            expect(requestId.addCorrelationIdToCtx(mockCtx)).toEqual({
                headers: {
                    'x-fl-hop-correlationid': mockCorrelationId
                },
                correlationId: mockCorrelationId
            });
        });
    });
});
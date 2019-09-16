import { Context } from 'koa';
import shortId from 'shortid';
import { addCorrelationIdToCtx } from './requestId';

describe('ctxHelpers', () => {
    describe('.addCorrelationIdToCtx', () => {
        it('should generate a correlation ID', () => {
            const spyOfShortIdGenerate = jest.spyOn(shortId, 'generate');
            const mockCorrelationId = '12345';
            const mockCtx = {} as Context;
            spyOfShortIdGenerate.mockReturnValue(mockCorrelationId);
            expect(addCorrelationIdToCtx(mockCtx)).toEqual({ correlationId: mockCorrelationId });
            spyOfShortIdGenerate.mockReset();
        });

        it('should use correlation ID from header', () => {
            const mockCorrelationId = '12345';
            const mockCtx = {
                headers: {
                    'x-fl-hop-correlationid': mockCorrelationId
                }
            } as Context;
            expect(addCorrelationIdToCtx(mockCtx)).toEqual({
                headers: {
                    'x-fl-hop-correlationid': mockCorrelationId
                },
                correlationId: mockCorrelationId
            });
        });
    });
});
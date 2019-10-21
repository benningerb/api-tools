import { Context } from 'koa';
import shortId from 'shortid';
import { addRequestIdToState, HEADER_KEY } from './requestId';

describe('requestId', () => {
	describe('.addRequestIdToState()', () => {
		it('should generate a request ID if not found in header', () => {
			const mockCorrelationId = '12345';
			const mockCtx = {} as Context;

			const spyOfShortIdGenerate = jest.spyOn(shortId, 'generate');
			spyOfShortIdGenerate.mockReturnValue(mockCorrelationId);

			const updatedCtx = addRequestIdToState(mockCtx, HEADER_KEY);
			expect(updatedCtx).toEqual({
				state: {
					requestId: mockCorrelationId,
				},
			});

			spyOfShortIdGenerate.mockReset();
		});

		it('should populate state with request ID from header', () => {
			const mockCorrelationId = '12345';
			const mockCtx = {
				headers: {
					[HEADER_KEY]: mockCorrelationId,
				},
			} as Context;

			expect(addRequestIdToState(mockCtx, HEADER_KEY)).toEqual({
				headers: {
					[HEADER_KEY]: mockCorrelationId,
				},
				state: {
					requestId: mockCorrelationId,
				},
			});
		});

		it('should allow you to specify the header key to look for', () => {
			const customHeaderKey = 'my-custom-header-key';
			const mockCorrelationId = '12345';
			const mockCtx = {
				headers: {
					[customHeaderKey]: mockCorrelationId,
				},
			} as Context;

			expect(addRequestIdToState(mockCtx, customHeaderKey)).toEqual({
				headers: {
					[customHeaderKey]: mockCorrelationId,
				},
				state: {
					requestId: mockCorrelationId,
				},
			});
		});
	});
});

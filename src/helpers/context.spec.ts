import { getHeaderValue, getQueryValue, getStateValue } from './context';
import { Context } from 'koa';

describe('ctxHelpers', () => {
    describe('.getHeaderValue', () => {
        it('should get a header (for case insensitive match)', () => {
            // Arrange
            const ctx = {
                headers: {
                    Authorization: 'bearer 3903403490',
                },
            } as Context;
            const keyToGet = 'aUthOrIzaTion';

            // Act
            const result = getHeaderValue(ctx, keyToGet);

            // Assert
            expect(result).toEqual('bearer 3903403490');
        });

        it('should NOT get a header (for case insensitive match)', () => {
            // Arrange
            const ctx = {
                headers: {
                    Authorization: 'bearer 3903403490',
                },
            } as Context;
            const keyToGet = 'something totally different';

            // Act
            const result = getHeaderValue(ctx, keyToGet);

            // Assert
            expect(result).toBeUndefined();
        });

        it('should get a header (for case sensitive match)', () => {
            // Arrange
            const ctx = {
                headers: {
                    Authorization: 'bearer 3903403490',
                },
            } as Context;
            const keyToGet = 'Authorization';

            // Act
            const result = getHeaderValue(ctx, keyToGet, true);

            // Assert
            expect(result).toEqual('bearer 3903403490');
        });

        it('should NOT get a header (for case sensitive match)', () => {
            // Arrange
            const ctx = {
                headers: {
                    Authorization: 'bearer 3903403490',
                },
            } as Context;
            const keyToGet = 'authoriZation';

            // Act
            const result = getHeaderValue(ctx, keyToGet, true);

            // Assert
            expect(result).toBeUndefined();
        });
    });

    describe('.getQueryValue', () => {
        it('should get a query value (for case insensitive match)', () => {
            // Arrange
            const ctx = {
                query: {
                    favoriteColor: 'blue',
                },
            } as Context;
            const keyToGet = 'favOrIteColor';

            // Act
            const result = getQueryValue(ctx, keyToGet);

            // Assert
            expect(result).toEqual('blue');
        });

        it('should NOT get a query value (for case insensitive match)', () => {
            // Arrange
            const ctx = {
                query: {
                    favoriteColor: 'blue',
                },
            } as Context;
            const keyToGet = 'totally different key';

            // Act
            const result = getQueryValue(ctx, keyToGet);

            // Assert
            expect(result).toEqual(undefined);
        });

        it('should get a query value (for case sensitive match)', () => {
            // Arrange
            const ctx = {
                query: {
                    favoriteColor: 'blue',
                },
            } as Context;
            const keyToGet = 'favoriteColor';

            // Act
            const result = getQueryValue(ctx, keyToGet, true);

            // Assert
            expect(result).toEqual('blue');
        });

        it('should NOT get a query value (for case sensitive match)', () => {
            // Arrange
            const ctx = {
                query: {
                    favoriteColor: 'blue',
                },
            } as Context;
            const keyToGet = 'favOrIteColor';

            // Act
            const result = getQueryValue(ctx, keyToGet, true);

            // Assert
            expect(result).toEqual(undefined);
        });
    });

    describe('.getStateValue', () => {
        it('should get a query value (for case insensitive match)', () => {
            // Arrange
            const ctx = {
                state: {
                    favoriteColor: { onMondays: 'blue', everyOtherDay: 'purple' },
                },
            } as Context;
            const keyToGet = 'favOrIteColor';

            // Act
            const result = getStateValue(ctx, keyToGet);

            // Assert
            expect(result).toEqual({ onMondays: 'blue', everyOtherDay: 'purple' });
        });

        it('should NOT get a query value (for case insensitive match)', () => {
            // Arrange
            const ctx = {
                state: {
                    favoriteColor: { onMondays: 'blue', everyOtherDay: 'purple' },
                },
            } as Context;
            const keyToGet = 'totally different key';

            // Act
            const result = getStateValue(ctx, keyToGet);

            // Assert
            expect(result).toEqual(undefined);
        });

        it('should get a query value (for case sensitive match)', () => {
            // Arrange
            const ctx = {
                state: {
                    favoriteColor: { onMondays: 'blue', everyOtherDay: 'purple' },
                },
            } as Context;
            const keyToGet = 'favoriteColor';

            // Act
            const result = getStateValue(ctx, keyToGet, true);

            // Assert
            expect(result).toEqual({ onMondays: 'blue', everyOtherDay: 'purple' });
        });

        it('should NOT get a query value (for case sensitive match)', () => {
            // Arrange
            const ctx = {
                state: {
                    favoriteColor: 'blue',
                },
            } as Context;
            const keyToGet = 'favOrIteColor';

            // Act
            const result = getStateValue(ctx, keyToGet, true);

            // Assert
            expect(result).toEqual(undefined);
        });
    });
});
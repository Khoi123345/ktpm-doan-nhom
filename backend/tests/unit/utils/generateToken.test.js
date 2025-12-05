import jwt from 'jsonwebtoken';
import generateToken from '../../../src/utils/generateToken.js';

describe('generateToken', () => {
    const mockUserId = '507f1f77bcf86cd799439011';

    beforeEach(() => {
        process.env.JWT_SECRET = 'test-secret-key';
        process.env.JWT_EXPIRE = '7d';
    });

    it('generateValidJWTToken', () => {
        const token = generateToken(mockUserId);

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3);
    });

    it('encodeUserIdInToken', () => {
        const token = generateToken(mockUserId);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        expect(decoded.id).toBe(mockUserId);
    });

    it('useConfiguredExpiryTime', () => {
        const token = generateToken(mockUserId);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        expect(decoded.exp).toBeDefined();
        expect(decoded.iat).toBeDefined();
        expect(decoded.exp - decoded.iat).toBe(604800); // 7 days in seconds
    });

    it('useDefaultExpiryIfJWTEXPIREIsNotSet', () => {
        delete process.env.JWT_EXPIRE;

        const token = generateToken(mockUserId);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        expect(decoded.exp - decoded.iat).toBe(2592000); // 30 days in seconds
    });

    it('createDifferentTokensForDifferentUserIDs', () => {
        const token1 = generateToken('user1');
        const token2 = generateToken('user2');

        expect(token1).not.toBe(token2);

        const decoded1 = jwt.verify(token1, process.env.JWT_SECRET);
        const decoded2 = jwt.verify(token2, process.env.JWT_SECRET);

        expect(decoded1.id).toBe('user1');
        expect(decoded2.id).toBe('user2');
    });
});

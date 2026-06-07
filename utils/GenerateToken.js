import jwt from 'jsonwebtoken'

export const generateToken = (user) => {
    const AccessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: '15m' });
    const RefreshToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
    return { AccessToken, RefreshToken };
}
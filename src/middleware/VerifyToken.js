import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: 'Access token not found' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.error(err);
            return res.status(403).json({ msg: 'Token is not valid' });
        }
        // Menyimpan informasi pengguna dari token di dalam objek request
        req.user = {
            id_user: user.id_user
        };
        next();
    });
};
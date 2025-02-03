import models from "../models/UserModels.js";
import jwt from "jsonwebtoken";

const { Users } = models; // Ambil model Users dari objek models

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ msg: "Refresh token not found" });
        }

        // Verifikasi refresh token
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                console.error(err);
                return res.status(403).json({ msg: "Token is not valid" });
            }

            // Model berdasarkan tipe pengguna (Users atau Order)
            let user;
            let accessToken;

            if (decoded.userId) {
                user = await Users.findOne({ where: { id_user: decoded.userId } });
                accessToken = jwt.sign({ userId: decoded.userId, username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            } else {
                return res.status(403).json({ msg: "Invalid token format" });
            }

            // Kirim access token baru
            res.json({ accessToken });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
};
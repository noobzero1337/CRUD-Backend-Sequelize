import express from "express";
import { 
    getUsers, 
    Register, 
    Login, 
    checkLoginStatus, 
    Logout,
    InputKaryawan,
    GetAllKaryawan,
    GetKaryawanByNik,
    KaryawanCount,
    UpdateKaryawan,
    GetKaryawanByNIKorNama,
    PelamarCountPerMonth,
    DeleteKaryawan 
} from "../controllers/Users.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";

const router = express.Router();

// Endpoint Routes untuk users
router.get('/users', verifyToken, getUsers);
router.post('/register', Register);
router.post('/login', Login);
router.get('/check-login', checkLoginStatus);
router.get('/token', refreshToken);
router.delete('/logout/:id_users', verifyToken, Logout);

router.post('/karyawan/add', InputKaryawan);
router.get('/karyawan/get', GetAllKaryawan);
router.get('/karyawan/get/:nik', GetKaryawanByNik);
router.get('/karyawan/count', KaryawanCount);
router.put('/karyawan/update', UpdateKaryawan);
router.get('/karyawan/search', GetKaryawanByNIKorNama);
router.get('/karyawan/getmonthly', PelamarCountPerMonth);
router.delete('/karyawan/delete', DeleteKaryawan);

export default router;
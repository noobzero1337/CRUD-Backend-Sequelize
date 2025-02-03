import models from "../models/UserModels.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import { Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import moment from "moment";

const { Users, Karyawan } = models; 


export const getUsers = async(req, res) => {
    try {
        const users = await Users.findAll({
            attributes:['id_user','username']
        });
        res.json(users);
    } catch (error) {
        console.log(error);
    }
}

// Untuk registrasi user pelanggan
export const Register = async(req, res) => {
    const { username, password, confPassword } = req.body;
    if(password !== confPassword) return res.status(400).json({msg: "Password dan Confirm Password tidak cocok"});
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    try {
        await Users.create({
            username: username,
            password: hashPassword,
            confPassword: hashPassword
        });
        res.json({msg: "Register Berhasil"});
    } catch (error) {
        console.log(error);
    }
}

// Untuk login user admin
export const Login = async(req, res) => {
    try {
        const { password } = req.body;

        // Cari pengguna berdasarkan name
        const users = await Users.findAll({
            where: { 
                username: req.body.username
             }
        });

        if (users.length === 0) {
            return res.status(404).json({ msg: "Kombinasi Nama Pengguna dan Password salah" });
        }

        const user = users[0];
        // Bandingkan password yang diberikan dengan yang disimpan
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ msg: 'Password salah' });
        }

        // Data pengguna yang valid, atur data yang dibutuhkan dalam token

        const { id_user } = user;
        const username = user.username;
        const accessToken = jwt.sign({ id_user, username }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '2h'
        });
        const refreshToken = jwt.sign({ id_user, username }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });

        // Simpan refreshToken di database
        await user.update({ refresh_token: refreshToken }, {
            where: { id_user }
        });

        // Setel cookie refreshToken
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 hari
            secure: true // Untuk HTTPS
        });

        // Kirim respons dengan accessToken dan id_user
        res.json({ accessToken, id_user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Gagal melakukan login' });
    }
};

// Check login status
export const checkLoginStatus = async (req, res) => {
    try {
      const token = req.cookies.refreshToken;
      if (!token) return res.json({ loggedIn: false });
  
      const user = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      const userData = await Users.findOne({
        where: {
          id_user: user.userId,
        },
        attributes: ['username']
      });
  
      if (!userData) return res.json({ loggedIn: false });
      
      res.json({
        loggedIn: true,
        username: userData.username
      });
    } catch (error) {
        console.error('Check login status error:', error);
        res.status(500).json({ loggedIn: false });
    }
  };

// Untuk logout user
export const Logout = async(req, res) => {
    try {
        const { id_users } = req.params;
        // Update refresh_token to null in database
        const user = await Users.update({ refresh_token: null }, {
            where: {
                id_user: id_users
            }
        });
        if (!user) {
            return res.status(204).json({ msg: "No user found with provided refresh token" });
        }

        // Clear refreshToken cookie
        res.clearCookie('refreshToken');

        // Send success message
        return res.status(200).json({ msg: "Token deleted successfully" });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
};

export const InputKaryawan = async(req, res) => {
    try {
        const { nik, nidn, id_ktp, nama, gelar_dp, gelar_bl, agama, tgl_lahir, tmp_lahir, 
          gol_darah, st_karyawan, st_nikah, alamat, telp, npwp, tgl_masuk 
        } = req.body;

        const parsedTglLahir = moment(tgl_lahir, 'DD-MM-YYYY').format('YYYY-MM-DD');
        const parsedTglMasuk = moment(tgl_masuk, 'DD-MM-YYYY').format('YYYY-MM-DD');
    
        const newKaryawan = await Karyawan.create({
          nik,
          nidn,
          id_ktp,
          nama,
          gelar_dp,
          gelar_bl,
          agama,
          tgl_lahir: parsedTglLahir,
          tmp_lahir,
          gol_darah,
          st_karyawan,
          st_nikah,
          alamat,
          telp,
          npwp,
          tgl_masuk: parsedTglMasuk,
        });
    
        res.status(201).json(newKaryawan);
      } catch (error) {
        if (error.name === 'SequelizeValidationError') {
          const validationErrors = error.errors.map(err => err.message);
          res.status(400).json({ error: 'Validation error', details: validationErrors });
        } else {
          console.error('Unexpected error:', error);
          res.status(500).json({ error: error.message });
        }
      }
};

// Controller to get all Karyawan data
export const GetAllKaryawan = async (req, res) => {
    try {
      const karyawans = await Karyawan.findAll({
        attributes: ['nik', 'nama', 'gelar_dp', 'gelar_bl', 'agama', 'tgl_lahir', 'tmp_lahir', 'alamat', 'telp', 'npwp', 'tgl_masuk']
      });
      res.status(200).json(karyawans);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data.' });
    }
  };
  
 
export const GetKaryawanByNik = async (req, res) => {
    const { nik } = req.params;
    try {
      const karyawan = await Karyawan.findOne({
        where: { nik },
        attributes: ['nik', 'nama', 'gelar_dp', 'gelar_bl', 'agama', 'tgl_lahir', 'tmp_lahir', 'alamat', 'telp', 'npwp', 'tgl_masuk']
      });
  
      if (karyawan) {
        res.status(200).json(karyawan);
      } else {
        res.status(404).json({ message: 'Data Karyawan tidak ditemukan.' });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data.' });
    }
};

export const KaryawanCount = async (req, res) => {
    try {
      const count = await Karyawan.count();
      res.status(200).json({ count });
    } catch (error) {
      res.status(500).json({ message: 'Error counting employees', error });
    }
};

export const UpdateKaryawan = async (req, res) => {
    const { searchBy, searchValue, updateField, newValue } = req.body;
  
    try {
      let employee;
      if (searchBy === 'nik') {
        employee = await Karyawan.findOne({ where: { nik: searchValue } });
      } else if (searchBy === 'nama') {
        employee = await Karyawan.findOne({ where: { nama: searchValue } });
      }
  
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
  
      employee[updateField] = newValue;
      await employee.save();
  
      res.status(200).json({ message: 'Employee data updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating employee data', error });
    }
};

export const GetKaryawanByNIKorNama = async (req, res) => {
    const { searchBy, searchTerm } = req.query;

    console.log(`searchBy: ${searchBy}, searchTerm: ${searchTerm}`);

    try {
        let karyawan;
        if (searchBy === 'nik') {
            karyawan = await Karyawan.findOne({ where: { nik: searchTerm } });
        } else if (searchBy === 'nama') {
            karyawan = await Karyawan.findOne({ where: { nama: searchTerm } });
        }

        console.log(`Karyawan found: ${JSON.stringify(karyawan)}`);

        if (!karyawan) {
            return res.status(404).json({ message: 'Karyawan not found' });
        }

        res.status(200).json(karyawan);
    } catch (error) {
        console.error('Error searching karyawan:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const PelamarCountPerMonth = async (req, res) => {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const karyawanCount = await Karyawan.count({
      where: {
        tgl_masuk: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    res.json({ karyawanCount });
  } catch (error) {
    console.error('Error fetching karyawan count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const DeleteKaryawan = async (req, res) => {
  const { nik, nama } = req.query;

  console.log(`Delete request - NIK: ${nik}, Nama: ${nama}`);

  if (!nik && !nama) {
    return res.status(400).json({ message: 'NIK or Nama is required' });
  }

  try {
    let deleted;
    if (nik) {
      deleted = await Karyawan.destroy({
        where: { nik }
      });
    } else if (nama) {
      deleted = await Karyawan.destroy({
        where: { nama }
      });
    }

    if (!deleted) {
      return res.status(404).json({ message: 'Karyawan not found' });
    }

    res.status(200).json({ message: 'Karyawan deleted successfully' });
  } catch (error) {
      console.error('Error deleting karyawan:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

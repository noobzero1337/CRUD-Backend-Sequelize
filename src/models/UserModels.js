import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import { v4 as uuidv4 } from 'uuid';

const { DataTypes } = Sequelize;

// Schema memasukan data ke tb_users
const Users = db.define('tb_users',{
    id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username:{
        type: DataTypes.STRING
    },
    password:{
        type: DataTypes.STRING
    },
    refresh_token:{
        type: DataTypes.TEXT
    }
},{
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

const Karyawan = db.define('tb_karyawan',{
    id_karyawan: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nik: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    nidn: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    id_ktp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gelar_dp: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    gelar_bl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    agama: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tgl_lahir: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    tmp_lahir: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gol_darah: {
        type: DataTypes.ENUM('A', 'B', 'AB', 'O'),
        allowNull: false,
    },
    st_karyawan: {
        type: DataTypes.ENUM('kontrak', 'tetap'),
        allowNull: false,
    },
    st_nikah: {
        type: DataTypes.ENUM('belum menikah', 'menikah'),
        allowNull: false,
    },
    alamat: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    telp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    npwp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tgl_masuk: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      }
    }, {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
});

const models = { Users, Karyawan };

export default models;
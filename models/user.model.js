import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phonenumber: {
    type: DataTypes.STRING,
    allowNull: true,
    // normalize before validation: +8801711000001 / 8801711000001 -> 01711000001
    set(value) {
      if (typeof value !== "string" || value.trim() === "") {
        this.setDataValue("phonenumber", null);
        return;
      }
      this.setDataValue("phonenumber", value.trim().replace(/^\+?880/, "0"));
    },
    validate: {
      // BD mobile: optional +880 or 880 or leading 0, then 1, then operator digit 3-9, then 8 digits
      is: {
        args: /^(?:\+?880|0)1[3-9]\d{8}$/,
        msg: "phonenumber must be a valid Bangladeshi mobile number",
      },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user',
  },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'createAt',
  updatedAt: 'updateAt',
});

export default User;

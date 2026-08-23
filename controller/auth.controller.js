import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const sign_up = async (req, res) => {
    try {
        const { firstname, lastname, email, phonenumber, password } = req.body

        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({
                message: "firstname, lastname, email and password are required"
            })
        }

        const existing = await User.findOne({ where: { email } })
        if (existing) {
            return res.status(409).json({
                message: "email already registered"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            firstname,
            lastname,
            email,
            phonenumber,
            password: hashedPassword
        })

        const { password: _password, ...safeUser } = user.toJSON()

        res.status(201).json({
            message: "user created successfully",
            data: safeUser
        })
    } catch (error) {
        console.error(error)

        // bad data from the client, not a server bug
        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: error.errors[0].message
            })
        }

        res.status(500).json({
            message: "something went wrong"
        })
    }
}


export const log_in = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "email and password are required"
            })
        }

        const user = await User.findOne({ where: { email } })

        // same message for unknown email and wrong password, so nobody
        // can use this endpoint to discover which emails are registered
        if (!user) {
            return res.status(401).json({
                message: "invalid email or password"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "invalid email or password"
            })
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.SECRET_KEY,
            { expiresIn: "1d" }
        )

        res.status(200).json({
            message: "login successful",
            token,
            data: {
                id: user.id,
                email: user.email
            }
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: "something went wrong"
        })
    }
}

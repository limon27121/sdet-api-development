import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// an expected, client-caused failure: the controller turns this into a
// response with the given status instead of a generic 500
export class ServiceError extends Error {
    constructor(status, message) {
        super(message)
        this.name = "ServiceError"
        this.status = status
    }
}

export const register_user = async ({ firstname, lastname, email, phonenumber, password }) => {
    if (!firstname || !lastname || !email || !password) {
        throw new ServiceError(400, "firstname, lastname, email and password are required")
    }

    const existing = await User.findOne({ where: { email } })
    if (existing) {
        throw new ServiceError(409, "email already registered")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
        firstname,
        lastname,
        email,
        phonenumber,
        password: hashedPassword
    })

    // never let the hash leave this layer
    const { password: _password, ...safeUser } = user.toJSON()

    return safeUser
}

export const login_user = async ({ email, password }) => {
    if (!email || !password) {
        throw new ServiceError(400, "email and password are required")
    }

    const user = await User.findOne({ where: { email } })

    // same message for unknown email and wrong password, so nobody
    // can use this endpoint to discover which emails are registered
    if (!user) {
        throw new ServiceError(401, "invalid email or password")
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
        throw new ServiceError(401, "invalid email or password")
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.SECRET_KEY,
        { expiresIn: "1d" }
    )

    return {
        token,
        user: {
            id: user.id,
            email: user.email
        }
    }
}

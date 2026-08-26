import { register_user, login_user, ServiceError } from "../Services/auth.service.js";

// one place to turn a thrown error into a response, so both handlers
// answer the same way for the same kind of failure
const send_error = (res, error) => {
    if (error instanceof ServiceError) {
        return res.status(error.status).json({
            message: error.message
        })
    }

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

export const sign_up = async (req, res) => {
    try {
        const { firstname, lastname, email, phonenumber, password } = req.body

        const user = await register_user({ firstname, lastname, email, phonenumber, password })

        res.status(201).json({
            message: "user created successfully",
            data: user
        })
    } catch (error) {
        send_error(res, error)
    }
}


export const log_in = async (req, res) => {
    try {
        const { email, password } = req.body

        const { token, user } = await login_user({ email, password })

        res.status(200).json({
            message: "login successful",
            token,
            data: user
        })
    } catch (error) {
        send_error(res, error)
    }
}

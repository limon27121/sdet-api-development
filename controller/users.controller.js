import User from "../models/user.model.js";

export const get_users = async (req, res) => {
    try {
        const users = await User.findAll()

        res.status(200).json({
            message: "user data found",
            data: users
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "something went wrong"
        })
    }
}

export const get_user_by_id = async (req, res) => {
    try {
        const user_id = Number(req.params.id)
        const user = await User.findByPk(user_id)

        if (!user) {
            return res.status(404).json({
                message: "user not found"
            })
        }

        res.status(200).json({
            message: "user found",
            data: user
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "something went wrong"
        })
    }
}

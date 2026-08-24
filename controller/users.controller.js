import fs from "fs";
import path from "path";
import User from "../models/user.model.js";
import { UPLOAD_DIR } from "../middlewares/upload.middleware.js";

export const get_users = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ["password"] }
        })

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
        const user = await User.findByPk(user_id, {
            attributes: { exclude: ["password"] }
        })

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

export const upload_photo = async (req, res) => {
    // remove a just-written file when the request cannot be completed
    const discard = async () => {
        if (req.file) await fs.promises.unlink(req.file.path).catch(() => {})
    }

    try {
        if (!req.file) {
            return res.status(400).json({
                message: "photo file is required"
            })
        }

        const user = await User.findByPk(req.user.id)

        if (!user) {
            await discard()
            return res.status(404).json({
                message: "user not found"
            })
        }

        const old_photo = user.photo
        // store a web path, not an absolute disk path
        const new_photo = `/uploads/${req.file.filename}`

        try {
            user.photo = new_photo
            await user.save()
        } catch (error) {
            // db write failed -> do not leave the file behind
            await discard()
            throw error
        }

        // drop the previous file so uploads/ does not grow forever
        if (old_photo && old_photo !== new_photo) {
            const old_name = path.basename(old_photo)
            await fs.promises
                .unlink(path.join(UPLOAD_DIR, old_name))
                .catch(() => {})
        }

        res.status(200).json({
            message: "photo uploaded",
            data: { id: user.id, photo: user.photo }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "something went wrong"
        })
    }
}

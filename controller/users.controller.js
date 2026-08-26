import fs from "fs";
import path from "path";
import User from "../models/user.model.js";
import { UPLOAD_DIR } from "../middlewares/upload.middleware.js";

export const get_users = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ["password"] }
        })

        //what response body show

        res.status(200).json({
            message: "user data found",
            data: users
        })

    } 
    
    catch (error) {
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
       

        //what response body show

        if (!user) {
            return res.status(404).json({
                message: "user not found"
            })
        }

        res.status(200).json({
            message: "user found",
            data: user
        })
    } 
    
    catch (error) {
        console.error(error)
        res.status(500).json({
            message: "something went wrong"
        })
    }
}



// POST /users/upload
//
// by the time this function runs, two middlewares have already done their job:
//   1. verify_token  -> read the Bearer token and put its payload on req.user
//   2. upload.single -> read the multipart body, write the file into uploads/
//                       and describe it on req.file
//
// so this function never touches the raw bytes. it only has to link the file
// that is already on disk to the row of the user who sent it.
export const upload_photo = async (req, res) => {
    // multer has already written the file before we can check anything about
    // the user, so every failure path below has to delete it again, otherwise
    // uploads/ fills up with files no row points to
    const discard = async () => {
        if (req.file) await fs.promises.unlink(req.file.path).catch(() => {})
    }

    try {
        // req.file is undefined when the form carried no file part at all.
        // a wrong field name never reaches here - multer throws first and
        // handle_upload_error answers with 400
        if (!req.file) {
            return res.status(400).json({
                message: 'no photo was attached, add a form-data field named "photo" with a file selected'
            })
        }

        // the id comes from the signed token, never from the request body,
        // so a caller can only ever replace their own photo
        const user = await User.findByPk(req.user.id)

        // the token was valid but the row is gone (deleted since login)
        if (!user) {
            await discard()
            return res.status(404).json({
                message: "user not found"
            })
        }

        // remember the previous file name before we overwrite the column,
        // because we still have to delete that old file from disk afterwards
        const old_photo = user.photo

        // store a web path, not an absolute disk path: this string is handed
        // straight to the browser, and express.static serves /uploads/*
        const new_photo = `/uploads/${req.file.filename}`

        try {
            user.photo = new_photo
            await user.save()
        } catch (error) {
            // the file is on disk but the column was never updated, so nothing
            // references it. delete it, then let the outer catch send the 500
            await discard()
            throw error
        }

        // the db now points at the new file, so the old one is dead weight.
        // basename() keeps only "photo-27-123.png" from "/uploads/photo-27-123.png",
        // so a stored value can never escape UPLOAD_DIR.
        // catch(() => {}) because a missing old file is not worth failing the request
        if (old_photo && old_photo !== new_photo) {
            const old_name = path.basename(old_photo)
            await fs.promises
                .unlink(path.join(UPLOAD_DIR, old_name))
                .catch(() => {})
        }

        // send back only what the client needs to render the image
        res.status(200).json({
            message: "photo uploaded",
            data: { id: user.id, photo: user.photo }
        })
    } catch (error) {
        // anything that lands here is a real bug or an outage, so log the stack
        // for us and give the client nothing that describes our internals
        console.error(error)
        res.status(500).json({
            message: "something went wrong"
        })
    }
}

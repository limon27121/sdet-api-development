import path from "path";
import { readFileSync } from "fs";

const readUsersFile=()=>{
    const usersFilePath=path.join(process.cwd(),"data","user.json")
    const userdata=readFileSync(usersFilePath,"utf-8");
    return JSON.parse(userdata)
}

export const get_users=(req,res)=>{
    try{
        const users=readUsersFile()

        res.status(200).json({
            message:"user data found",
            data:users
        })
    }catch(error){
        console.error(error)
        res.status(500).json({
            message:"something went wrong"
        })
    }
}

export const get_user_by_id=(req,res)=>{
    try{
        const users=readUsersFile()
        const user_id=Number(req.params.id)
        const user=users.find((u)=>u.userId===user_id)

        if(!user){
            return res.status(404).json({
                message:"user not found"
            })
        }

        res.status(200).json({
            message:"user found",
            data:user
        })
    }catch(error){
        console.error(error)
        res.status(500).json({
            message:"something went wrong"
        })
    }
}

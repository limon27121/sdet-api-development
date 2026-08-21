// LEGACY - original single-file version, kept for reference only.
// Not imported anywhere. Live entry point is server.js.

import express from "express";
import path from "path"
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { json } from "stream/consumers";
dotenv.config();
const app = express();
const PORT = process.env.PORT | 5001

app.get("/hello", (req, res) => {
 const username=req.query.username; //query param
 if(!username){
    return res.status(400).json({
        message:"username is required"
    })
 }
 res.status(200).json(
    {
        data: `hello ${username}`
    }
 )
});


app.get("/users",(req,res)=>{
    const usersFilePath=path.join(process.cwd(),"data","user.json")
    const userdata=readFileSync(usersFilePath,"utf-8");
    const users=JSON.parse(userdata)

    res.status(200).json({
        message:"user data found",
        data:users
    })

})


app.get("/user/:id",(req,res)=>{
    try{
        const usersFilePath=path.join(process.cwd(),"data","user.json")
        const userdata=readFileSync(usersFilePath,"utf-8");
        const users=JSON.parse(userdata)
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
    }
    catch(error){
        console.error(error)
        res.status(500).json({
            message:"something went wrong"
        })
    }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

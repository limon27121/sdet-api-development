export const get_hello=(req,res)=>{
    try{
        const username=req.query.username; //query param
        if(!username){
            return res.status(400).json({
                message:"username is required"
            })
        }
        res.status(200).json({
            data: `hello ${username}`
        })
    }catch(error){
        console.error(error)
        res.status(500).json({
            message:"something went wrong"
        })
    }
}

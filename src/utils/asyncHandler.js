// const asyncHandler= (fn)=>{()=>{}}
// const asyncHandler= (fn)=>()=>{}
    // const asyncHandler= (fn)=>{
    //     return(
    //     // async function(){

    //     // }
    //     async ()=>{
            
    //     }
    // )
    // }
    // const asyncHandler= (fn)=>
    //     (async (req,res,next)=>{
    //         try {  
    //             await fn();
    //         } catch (error) {
    //             res.status(err.code||500).json({
    //                 success:false,
    //                 message:err.message,
    //             })
    //         }
    //     })

    const asyncHandler=(fn)=>(
        (req,res,next)=>{
        Promise.resolve(fn(req,res,next)).catch((err)=>next(err))
        }
        )
export {asyncHandler}
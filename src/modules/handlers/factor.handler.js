import { catchAsyncError } from "../../middleware/catchAsyncError.js"
import { AppError } from "../../utils/AppError.js"



export const deleteOne = (model) => {
    return catchAsyncError(async (req, res, next) => {
        const { id } = req.params
        let result = await model.findByIdAndDelete(id)

        !result && next(new AppError(`Document not found`), 404)
        result && res.status(200).json({ message: "successfully deleted", result })
    })
}


export const updateFun = (Model) => {
    return catchAsyncError(async (req, res,next) => {
    const { id } = req.params;
    let document = await Model.findByIdAndUpdate(id,req.body,{new:true});
    if (!document) {
        return next(new AppError(`document Not Found To Update`, 404));
    }
    res.status(200).json({ message: `document has Been Updated`  , document});
})
}

export const getSpecficFun = (Model) => {
    return catchAsyncError(async (req, res,next) => {
    const { id } = req.params;
    let document = await Model.find({_id:id});
    if (!document) {
        return next(new AppError(`No document Found `, 404));
    }
    res.status(200).json({ message: `Document `  , document});
})
}

export const getAllFun = (Model) => {
    return catchAsyncError(async (req, res,next) => {
    let documents = await Model.find();
    if (!documents) {
        return next(new AppError(`No documents Found `, 404));
    }
    res.status(200).json({ message: `Documents `  , documents});
})
}
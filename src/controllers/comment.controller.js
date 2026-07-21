import mongoose, { Aggregate, isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import aggregatePaginate from "mongoose-aggregate-paginate/lib/mongoose-aggregate-paginate.js"
import { User } from "../models/user.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const aggregatePipeline = [ // sare ke sare comments aa gaye hai
        {
            $match: { // hume ek specific video ke comment chaiye that is why we need filter
                video: new mongoose.Types.ObjectId(videoId)
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "authorDetails"
            }
        },

        {
            $unwind: "$authorDetails"
        },

        {
            $project: {
                content: 1, // Comment ka text dikhao
                createdAt: 1, // Kab comment kiya wo dikhao
                // Author ki sirf photo aur username dikhao (password/email nahi!)
                "authorDetails.username": 1,
                "authorDetails.avatar": 1
            }
        }
    ]

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    // Mongoose Pagination Plugin ko pipeline aur options de do
    const allComments = await Comment.aggregatePaginate(Comment.aggregate(aggregatePipeline), options);

    return res
    .status(200)
    .json(new ApiResponse(200, allComments, "all comments fatched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    
    const {content} = req.body
    const {videoId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "video id is invalid")
    }

    if(!content || !content.trim()){
        throw new ApiError(400, "comment cannot be empty")
    }

    const comment = await Comment.create(
        {
            content: content,
            video: videoId,
            owner: userId
        }
    )

    if(!comment){
        throw new ApiError(500, "comment is not added")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment added successfull"))
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user._id
    const {content} = req.body

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "comment id is invalid")
    }

    if(!content || !content.trim()){
        throw new ApiError(400, "comment cannot be empty")
    }

    const newComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: userId
        },
        {
            $set: {
                content: content
            }
        },
        {new: true}
    )

    if(!newComment){
        throw new ApiError(404, "comment is not updated")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, newComment, "comment update successfull"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "comment id is invalid")
    }

    const deletedComment = await Comment.findOneAndDelete(
        {
            _id: commentId,
            owner: userId
        }
    )

    if(!deletedComment){
        throw new ApiError(404, "comment is not deleted or user is unauthorized")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }
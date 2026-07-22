import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { application } from "express"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(videoId)){
        throw new ApiError(404, "this video id is invalid format")
    }

    const existLike = await Like.findOne(
        {
        video: videoId,
        likedBy: userId
        }
    )

    if(!existLike){
        const like = await Like.create({
            video: videoId,
            likedBy: userId
        })

        if(!like){
            throw new ApiError(500, "unauthorized request or like could not added to your video")
        }

        return res
        .status(200)
        .json(new ApiResponse(200, like, "video liked successfull"))
    }

    else {
        const unlike = await Like.findByIdAndDelete(existLike._id)

        if(!unlike){
            throw new ApiError(500, "like could not proceed")
        }

        return res
        .status(200)
        .json(new ApiResponse(200, unlike, "video unlike successfull"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "comment id is invalid")
    }

    const existLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    if(!existLike){
        const like = await Like.create({
            comment: commentId,
            likedBy: userId
        })

        if(!like){
            throw new ApiError(500, "like is not added to comment")
        }

        return res
        .status(200)
        .json(new ApiResponse(200, {isLike: true}, "comment liked successfull"))
    }

    else {
        const unlike = await Like.findByIdAndDelete(existLike._id)

        if(!unlike){
            throw new ApiError(500, "like could not proceed")
        }

        return res
        .status(200)
        .json(new ApiResponse(200, {islike: false}, "comment unlike successfull"))
    }

}) 

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(tweetId)){
        throw new ApiError(404, "tweet id is invalid")
    }

    const existLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })

    if(!existLike){
        const like = await Like.create({
            tweet: tweetId,
            likedBy: userId
        })

        if(!like){
            throw new ApiError(500, "like is not added")
        }

        return res
        .status(200)
        .json(new ApiResponse(200, {isLike: true}, "like is added successfull"))
    }

    else {
        const unlike = await Like.findByIdAndDelete(existLike._id);

        if(!unlike){
            throw new ApiError(500, "Unlike operation failed")
        }

        return res
        .status(200)
        .json(new ApiResponse(200, {isLike: false}, "tweet unlike successful"))
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user._id

    const allLikedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId)
            }
        },

        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },

        {
            $unwind: "$videoDetails"
        },

        {
            $lookup: {
                from: "users",
                localField: "videoDetails.owner",
                foreignField: "_id",
                as: "userDetails"
            }
        },

        {
            $unwind: "$userDetails"
        },

        {
            $project: {
                _id: 1,
                "videoDetails._id": 1,
                "videoDetails.thubnail": 1,
                "videoDetails.title": 1,
                "videoDetails.discription": 1,
                "videoDetails.duration": 1,
                "videoDetails.views": 1,
                "userDetails.avatar": 1,
                "userDetails.username": 1
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, allLikedVideos, "Liked videos fetched successfully"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
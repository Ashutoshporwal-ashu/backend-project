import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    //1 total subscribers
    const userId = req.user._id
    const totalSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(userId)
            }
        },

        {
            $count: "totalSubscriber"
        },

        {
            $project: {
                totalSubscribers: 1
            }
        }
    ])
    //2 total video
    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },

        {
            $group: {
                _id: null,

                totalVideos: {$sum: 1},
                totalViews: {$sum: "$views"}
            }
        },

        {
            $project: {
                totalVideos: 1,
                totalViews: 1
            }
        }
    ])
    
    //total likes
    const totalLikes = await Like.aggregate([
        {
            $lookup: {
                form: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },

        {
            $unwind: "$videoDetails"
        },

        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },

        {
            $count: "totalLikes"
        }
    ])

    const stats = {
        totalSubscribers: totalSubscribers[0]?.subscribersCount || 0,
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalViews: videoStats[0]?.totalViews || 0,
        totalLikes: totalLikes[0]?.likesCount || 0
    };

    return res
    .status(200)
    .json(new ApiResponse(200, stats, "All stats fetched successfull"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user._id

    const allVideos = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },

        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "VideoDetails"
            }
        },

        {
            $unwind: "$VideoDetails"
        },

        {
            $project: {
                _id: 1,
                "VideoDetails._id": 1,
                "VideoDetails.thumbnail": 1,
                "VideoDetails.videoFile": 1,
                "VideoDetails.discription": 1,
                "VideoDetails.views": 1,
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, allVideos, "all videos fetched successfully"))

})

export {
    getChannelStats, 
    getChannelVideos
    }
import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Subscription } from "../models/subscription.models.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId = req.user._id;

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "channel id is invalid")
    }

    const existChannel = await Subscription.findOne({
        channel: channelId,
        subscriber: userId
    })

    if(!existChannel){
        const subscribe = await Subscription.create(channelId)

        if(!subscribe){
            throw new ApiError(500, "channel could not subscribed")
        }

        return res
        .status(200)
        .json(new ApiResponse(200, {isSubscribe: true}, "channel subscribed successfully"))
    }

    else {
        const unSubscribe = await Subscription.findOneAndDelete(existChannel._id)

        if(!unSubscribe){
            throw new ApiError(500, "channel could not unsubscribe")
        }

        return res
        .status(200)
        .json(new ApiResponse(200, {isSubscribe: false}, "channel unsubscribe successfull"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel ID")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "subscriber",
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
                "userDetails._id": 1,
                "userDetails.username": 1,
                "userDetails.avatar": 1,
                "userDetails.fullname": 1
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "All subscribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "Subscriber Id is invalid")
    }

    const allSubscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails"
            }
        },

        {
            $unwind: "$channelDetails"
        },

        {
            $project: {
                _id: 1,
                "channelDetails._id": 1,
                "channelDetails.fullname": 1,
                "channelDetails.username": 1,
                "channelDetails.avatar": 1,
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, allSubscribedChannels, "channels detail fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
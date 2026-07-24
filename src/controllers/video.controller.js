import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { read } from "fs"
import { title } from "process"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    
    const pipeline = []

    if(query){
        pipeline.push({
            $match: {
                $or: [
                    {title: {$regex: query, $options: "i"}},
                    {discription: {$regex: query, $options: "i"}}
                ]
            }
        })
    }

    if(userId){
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        })
    }

    pipeline.push({
        $match: {
            isPublished: true
        }
    })

    if(sortBy && sortType){
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "desc" ? -1 : 1
            }
        });
    } else {
        pipeline.push({$sort: {createdAt: -1}})
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const videoAggregate = await Video.aggregate(pipeline)
    const videos = await Video.aggregatePaginate(videoAggregate, options)

    return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, discription, isPublic} = req.body
    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const userId = req.user._id;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if(!thumbnailLocalPath){
        throw new ApiError(400, "thumbnail is required")
    }

    if(!videoLocalPath){
        throw new ApiError(400, "video file is required")
    }

    if(!title || !title.trim()){
        throw new ApiError(400, "title is required");
    }

    if(!discription || !discription.trim()){
        throw new ApiError(400, "description is required")
    }

    const video = await uploadOnCloudinary(videoLocalPath)
    const thumnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!video){
        throw new ApiError(500, "failed to upload on cloudinary")
    }

    if(!thumnail){
        throw new ApiError(500, "failed to upload on cloudinary")
    }

    const uploadVideo = await Video.create({
        title,
        discription,
        thumbnail: thumnail.secure_url,
        videoFile: video.secure_url,
        duration: video.duration,
        isPublic,
        owner: userId
    })

    if(!uploadVideo){
        throw new ApiError(500, "video upload failed")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, uploadVideo, "video uploaded successfull"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Video id is invalid format")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "video is not avalable of this id")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfull"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title, discription} = req.body
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path
    const userId = req.user._id

    if(!isValidObjectId(videoId)){
        throw new ApiError(404, "video id is invalid")
    }

    if(!title || !title.trim()){
        throw new ApiError(400, "title is required");
    }

    if(!discription || !discription.trim()){
        throw new ApiError(400, "description is required")
    }

    if(!thumbnailLocalPath){
        throw new ApiError(400, "thumbnail is required")
    }

    const video = await Video.findOne({_id: videoId, owner: userId})

    if(!video){
        throw new ApiError(404, "video is not found")
    }

    if(video.thumbnail){
        await deleteFromCloudinary(video.thumbnail, "image")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    const updatedVideo = await Video.findOneAndUpdate(
        {
        _id: videoId,
        owner: userId,
        },

        {
            $set: {
                discription: discription,
                title: title,
                thumbnail: thumbnail.secure_url
            }
        },
        {
            new: true
        }
    )

    if(!updatedVideo){
        throw new ApiError(500, "video could not updated")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "video update successfull"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "video id is invalid format")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "video is not exist")
    }

    if(video.videoFile){
        await deleteFromCloudinary(video.videoFile, "video");
    }

    if (video.thumbnail) {
        await deleteFromCloudinary(video.thumbnail, "image"); 
    }


    const deleteVideo = await Video.findByIdAndDelete(videoId)

    if(!deleteVideo){
        throw new ApiError(500, "Video could not delete")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfull"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "video id is invalid format")
    }

    const video = await Video.findById(videoId)
    
    if(!video){
        throw new ApiError(200, "video does not exist")
    }

    if(video.owner.toString() !== userId.toString()){
        throw new ApiError(400, "You are not allowed to change")
    }

    video.isPublic = !video.isPublic

    const updatedVideo = await video.save({validateBeforeSave: false})

    const statusMsg = updatedVideo.isPublic ? "video is public" : "video is private"

    return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, statusMsg))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
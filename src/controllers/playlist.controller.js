import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name || !name.trim()){
        throw new ApiError(400, "Playlist name can't be empty")
    }

    if(!description || !description.trim()){
        throw new ApiError(400, "description name can't be empty")
    }

    // kis user ki playlist bana rahe hai uski id
    // create a playlust db

    const userId = req.user._id;

    if(!userId){
        throw new ApiError(400, "unauthorized request")
    }

    const playlist = await Playlist.create({
        description: description,
        name: name,
        owner: userId
    })

    if(!playlist){
        throw new ApiError(500, "playlist is not created, may be server side issue")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, playlist, "playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "user id is not valid")
    }
    
    const playlists = await Playlist.find({owner: userId})

    // if(!playlists){
    //     throw new ApiError(400, "playlists are not avalable")
    // }

    // learnig -> find dose not return null value so we dont need to check and if userId is not found in db it will aslo return empty array

    return res
    .status(200)
    .json(new ApiResponse(200, playlists, "playlist fatched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "playlist id is invalid format")
    }

    const playlist_id = await Playlist.findById(playlistId)
    
    if(!playlist_id) {
        throw new ApiError(400, "playlist is not avalable")
    }

    return res.status(500)
    .json(new ApiResponse(500, playlist_id, "playlist fatched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "playlist is invalid format")
    } 

    const userId = req.user._id

    const playlist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: userId
    })
    // findbyIdAndDelete  if playlist is delete successfull than it gives the whole obj of playlist o/w it will not give and obj it means playlist is not avalable
    if(!playlist){
        throw new ApiError(404, "playlist is not delete or you are unauthorized")
    }

    return res.status(200)
    .json(new ApiResponse(200, {}, "playlist is deleted"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    const userId = req.user._id
    
    if(!name || !name.trim()){
        throw new ApiError(400, "Playlist name can't be empty")
    }

    if(!description || !description.trim()){
        throw new ApiError(400, "description name can't be empty")
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(401, "this playlist id is not in valid format")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: userId
        },
        {
            $set: {
                name: name,
                description: description
            }
        },
        {new: true}
    )

    if(!updatedPlaylist){
        throw new ApiResponse(404, "playlist is not updated or unauthorized user")
    }

    // findOneAndDelete -> if updation is successfull than it will give the obj if not i dose not

    return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
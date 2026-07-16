import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { constrainedMemory } from "process"
import { countReset } from "console"

const createTweet = asyncHandler(async (req, res) => {

    // frontend se content
    // and check the content empty or not
    // aab jo bhi user create kar raha hai uski id taki me uske databse me dalsaku and res me uss content ko de saku
    const { content } = req.body

    if(!content.trim()){
        throw new ApiError(400, "content can't be empty")
    }

    const userId = req.user._id

    const tweet = await Tweet.create({
        content: content,
        owner: userId
    })

    if(!tweet){
        throw new ApiError(500, "tweet has not been created");
    }

    return res
    .status(201)
    .json(new ApiResponse(200, tweet, "tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // muje vo pata karna hai ki kis user id ke tweets chaiye and tweets ki id
    // particular user ke particular tweets nikalenge db se
    // final response de denge

    const userId = req.user._id


    const tweet = await Tweet.find({owner: userId})
    if(!tweet){
        throw new ApiError(400, "posts are not avalable")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet fatched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    // user id and kis tweet ko upldate kar rahe hai uski id
    // db me us id and todo ke basis par find and check userid and tweet id exist or not if not -> usse update kar denge
    // and old tweet ko new tweet se replace kar denge in db

    const userId = req.user._id
    const {tweetId} = req.params
    const {content} = req.body

    if(!content || !content.trim()){
        throw new ApiError(400, "content is required")
    }

    if(!tweetId){
        throw new ApiError(400, "tweed id is missing")
    }

    const updatedTweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetyId,
            owner: userId
        },
        {
            $set: {
                content: content
            }
        },
        {new: true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200, updateTweet, "tweet is updated successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    // user id and tweet id is required
    // delete the post of that id

    const {tweetId} = req.params
    const userId = req.user._id

    if(!tweetId){
        throw new ApiError(401, "this tweet is not exist")
    }

    const tweet = await Tweet.findOneAndDelete({ _id: tweetId, owner: userId }, {new: true})

    if(!tweet){
        throw new ApiError(400, "Unauthorized request")
    }

    return res
    .status(201)
    .json(new ApiResponse(201,
        {},
        "tweet delete sucessfull"
    ))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
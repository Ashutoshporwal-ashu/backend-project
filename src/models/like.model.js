import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({

    video: {
            type: Schema.Types.ObjectId,
            req: "Video",
        },

    comment: {
            type: Schema.Types.ObjectId,
            req: "comment",
        },

    tweet: {
            type: Schema.Types.ObjectId,
            req: "tweet",
        },

    likedBy: {
        type: Schema.Types.ObjectId,
        req: "User",
    },

}, {timestamps: true})

export const Like = mongoose.model("Like", likeSchema)
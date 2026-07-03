import mongoose, {Schema} from "mongoose";
import { User } from "./user.model";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const videoSchema = new Schema({
    vodeoFile: {
        type: String,
        required: true,
    },

    thumbnail: {
        type: String,
        required: true,
    },

    title: {
        type: String,
        required: true,
    },

    discription: {
        type: String,
        required: true,
    },

    duration: {
        type: Number, // cloudnary
        required: true,
    },

    views: {
        type: Number,
        default: 0,
    },

    isPublic: {
        type: Boolean,
        default: true
    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }


}, {timestamps: true});

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)
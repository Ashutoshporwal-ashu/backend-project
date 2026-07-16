import mongoose, {Schema} from "mongoose";
import { User } from "./user.model";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
    },

    video: {
        type: Schema.Types.ObjectId,
        req: "Video",
    },

    owner: {
        type: Schema.Types.ObjectId,
        req: "User",
    }

}, {timestamps: true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment",commentSchema) 
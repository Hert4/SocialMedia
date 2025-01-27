import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import {v2 as cloudinary} from "cloudinary"

const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;

    let {img} = req.body
    if (!postedBy || !text) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }


    const user = await User.findById(postedBy);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to create post" });
    }

    const MAX_LENGTH = 500;
    if (text.length > MAX_LENGTH) {
      return res.status(400).json({
        error: `Text length must be less than ${MAX_LENGTH} characters`,
      });
    }

    if(img){
      const uploadedResponse = await cloudinary.uploader.upload(img)
      img = uploadedResponse.secure_url
    }

    const newPost = new Post({
      postedBy,
      text,
      img,
    });

    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in createPost: ", error.message);
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getPost: ", error.message);
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "You can not delete this post" });
    }

    if(post.img){
      const imgId = post.img.split("/").pop().split(".")[0]
      await cloudinary.uploader.destroy(imgId)
    }

    let removePost = {
      _id: post._id,
      postedBy: post.postedBy,
      text: post.text,
      img: post.img,
      createdAt: post.createdAt,
    };

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted successfully", removePost });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in deletePost: ", error.message);
  }
};

const likeUnlikePost = async (req, res) => {
  try {
    const {id: postId} = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if(!post) {
      return res.status(404).json({error: "Post not found"});
    }

    const userLikedPost = post.likes.includes(userId);

    if(userLikedPost) {
      await Post.updateOne({_id: postId}, {$pull: {likes: userId}});
      res.status(200).json({message: "Post unliked successfully"});
    } else {
      post.likes.push(userId);
      await post.save();
      res.status(200).json({message: "Post liked successfully"});
    }

  }catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in likeUnlikePost: ", error.message);
  }
}

const replyToPost = async (req, res) => {
	try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;
		const userProfilePic = req.user.profilePic;
		const username = req.user.username;

		if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}

		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const reply = { userId, text, userProfilePic, username };

		post.replies.push(reply);
		await post.save();

		res.status(200).json(reply);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};



const getFeedPost = async (req, res) => {
  try{
    const userId = req.user._id;
    const user = await User.findById(userId)

    if (!user){
      return res.status(404).json({error: "User not found"});
    }

    const following = user.following;

    // const feed = await Post.find({postedBy: {$in: following}}).sort({createdAt: -1});
    
    // Fetch posts from followed users
    const followedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 });

    // Fetch all other posts, excluding followed users
    const otherPosts = await Post.find({ postedBy: { $nin: following } }).sort({ createdAt: -1 });

    const feed = [...followedPosts, ...otherPosts];

    res.status(200).json(feed);
  }catch (error){
    res.status(500).json({ error: error.message });
    console.log("Error in getFeedPost: ", error.message);
  }
}

const getUserPosts = async (req, res) => {
  const {username} = req.params
  try {
    const user = await User.findOne({username})

    if(!user){
      return res.status(404).json({error: "User not found"})
    }
    const posts = await Post.find({postedBy: user._id}).sort({createAt: -1})
    res.status(200).json(posts)

  }catch (error){
    res.status(500).json({error: error.message})
  }
}
export { createPost, getPost, deletePost, likeUnlikePost, replyToPost, getFeedPost, getUserPosts };

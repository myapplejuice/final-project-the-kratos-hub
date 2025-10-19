import PostsDBService from "./community-db-service.js";
import SocketController from "../socket/socket-controller.js";
import NotificationsDBService from "../notifications/notifications-db-service.js";

export default class CommunityController {
    static async getPosts(req, res) {
        const { forUser, userId, page, topic, limit } = req.body;

        const response = await PostsDBService.fetchPosts(forUser, userId, page || 1, limit, topic || null);

        return res.status(200).json({
            success: true,
            posts: response.posts,
            page: response.page,
            hasMore: response.hasMore
        });
    }

    static async createPost(req, res) {
        const details = req.body;

        const result = await PostsDBService.createPost(details);
        if (!result.success) return res.status(400).json({ message: result.message });

        return res.status(200).json(result);
    }

    static async updatePost(req, res) {
        const details = req.body;

        const result = await PostsDBService.updatePost(details);
        if (!result.success) return res.status(400).json({ message: result.message });

        return res.status(200).json(result);
    }

    static async deletePost(req, res) {
        const { postId } = req.body;

        const result = await PostsDBService.deletePost(postId);
        if (!result.success) return res.status(400).json({ message: result.message });

        return res.status(200).json(result);
    }

    static async likePost(req, res) {
        const {
            userId,
            postId,
            userFirstname,
            userLastname,
            posterId,
            postImageURL,
        } = req.body;

        const result = await PostsDBService.likePost(userId, postId);
        if (!result.success) return res.status(400).json({ message: result.message });

        const payload = {
            userId: posterId,
            notification: `${userFirstname} ${userLastname} liked one of your posts`,
            seen: false,
            clickable: true,
            clickableInfo: JSON.stringify({ postId, postImageURL }),
            clickableDestination: 'user-post',
            sentiment: "positive",
            dateOfCreation: new Date()
        }
        
        const id = await NotificationsDBService.pushNotification(payload);
        payload.id = id;
        payload.clickableInfo = JSON.parse(payload.clickableInfo);
        SocketController.emitNotification(posterId, payload);

        return res.status(200).json(result);
    }

    static async savePost(req, res) {
        const { userId, postId } = req.body;

        const result = await PostsDBService.savePost(userId, postId);
        if (!result.success) return res.status(400).json({ message: result.message });

        return res.status(200).json(result);
    }

    static async sharePost(req, res) {
        const { postId } = req.body;

        const result = await PostsDBService.sharePost(postId);
        if (!result.success) return res.status(400).json({ message: result.message });

        return res.status(200).json(result);
    }
}
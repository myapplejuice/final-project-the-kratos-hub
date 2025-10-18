import sql from 'mssql/msnodesqlv8.js';
import Database from '../database/database.js';
import ObjectMapper from '../../utils/object-mapper.js';

export default class CommunityDBService {
    static async fetchPosts(forUser = false, userId, page = 1, pageSize = 10, type = null) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);
            Database.addInput(request, 'Offset', sql.Int, (page - 1) * pageSize);
            Database.addInput(request, 'PageSize', sql.Int, pageSize);

            let query = `
            SELECT p.*,
                   p.LikeCount,
                   p.ShareCount,
                   u.Id AS UserId, u.Firstname, u.Lastname, u.ImageURL,
                   t.IsVerified, t.TrainerStatus,
                   CASE WHEN l.Id IS NOT NULL THEN 1 ELSE 0 END AS IsLikedByUser,
                   CASE WHEN s.Id IS NOT NULL THEN 1 ELSE 0 END AS IsSavedByUser
            FROM Posts p
            INNER JOIN Users u ON u.Id = p.UserId
            LEFT JOIN UserTrainerProfile t ON t.UserId = u.Id
            LEFT JOIN Likes l ON l.PostId = p.Id AND l.UserId = @UserId
            LEFT JOIN SavedPosts s ON s.PostId = p.Id AND s.UserId = @UserId
            WHERE p.UserId ${forUser ? '=' : '!='} @UserId
        `;

            if (type) {
                Database.addInput(request, 'Type', sql.VarChar(20), type);
                query += ` AND p.Type = @Type`;
            }

            query += `
            ORDER BY p.Id DESC
            OFFSET @Offset ROWS
            FETCH NEXT @PageSize ROWS ONLY;
        `;

            const result = await request.query(query);

            const posts = result.recordset.map(row => {
                const post = {};
                for (const key in row) {
                    let value = row[key];
                    if (key === 'ImagesURLS') value = value ? JSON.parse(value) : [];
                    post[ObjectMapper.toCamelCase(key)] = value;
                }

                post.user = {
                    id: row.UserId,
                    firstname: row.Firstname,
                    lastname: row.Lastname,
                    imageURL: row.ImageURL,
                    trainerProfile: {
                        trainerStatus: row.TrainerStatus || 'inactive',
                        isVerified: !!row.IsVerified,
                    },
                };

                post.isLikedByUser = !!row.IsLikedByUser;
                post.isSavedByUser = !!row.IsSavedByUser;

                return post;
            });

            return {
                posts,
                page,
                hasMore: posts.length === pageSize
            };
        } catch (err) {
            console.error('fetchPosts error:', err);
            return { posts: [], page, hasMore: false };
        }
    }

    static async createPost(details) {
        try {
            const request = Database.getRequest();

            Database.addInput(request, 'UserId', sql.UniqueIdentifier, details.userId);
            Database.addInput(request, 'ImagesURLS', sql.NVarChar(sql.MAX), JSON.stringify(details.imagesURLS || []));
            Database.addInput(request, 'Caption', sql.NVarChar(sql.MAX), details.caption || '');
            Database.addInput(request, 'DateOfCreation', sql.DateTime2, Date.now());
            Database.addInput(request, 'Type', sql.VarChar(20), details.type || 'general');

            const insertQuery = `
                INSERT INTO Posts (UserId, ImagesURLS, Caption, DateOfCreation, Type)
                OUTPUT inserted.Id
                VALUES (@UserId, @ImagesURLS, @Caption, @DateOfCreation, @Type)
            `;

            const result = await request.query(insertQuery);
            const postId = result.recordset[0]?.Id;

            return { success: true, message: 'Post created successfully', postId };
        } catch (err) {
            console.error('createPost error:', err);
            return { success: false, message: 'Failed to create post' };
        }
    }

    static async updatePost(details) {
        try {
            const request = Database.getRequest();

            Database.addInput(request, 'Id', sql.Int, details.postId);
            Database.addInput(request, 'ImagesURLS', sql.NVarChar(sql.MAX), JSON.stringify(details.imagesURLS || []));
            Database.addInput(request, 'Caption', sql.NVarChar(sql.MAX), details.caption || '');
            Database.addInput(request, 'Type', sql.VarChar(20), details.type || 'general');

            const updateQuery = `
                UPDATE Posts
                SET ImagesURLS = @ImagesURLS,
                    Caption = @Caption,
                    Type = @Type
                WHERE Id = @Id
            `;

            await request.query(updateQuery);
            return { success: true, message: 'Post updated successfully', postId: details.postId };
        } catch (err) {
            console.error('updatePost error:', err);
            return { success: false, message: 'Failed to update post' };
        }
    }

    static async deletePost(postId) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, postId);

            const deleteQuery = `DELETE FROM Posts WHERE Id = @Id`;
            const result = await request.query(deleteQuery);

            if (!result.rowsAffected[0]) return { success: false, message: 'Post not found or already deleted' };
            return { success: true, message: 'Post deleted successfully' };
        } catch (err) {
            console.error('deletePost error:', err);
            return { success: false, message: 'Failed to delete post' };
        }
    }

    static async likePost(userId, postId) {
        try {
            const request = Database.getRequest();

            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);
            Database.addInput(request, 'PostId', sql.Int, postId);

            // Check if already liked
            const checkQuery = `SELECT Id FROM Likes WHERE UserId = @UserId AND PostId = @PostId`;
            const existing = await request.query(checkQuery);
            if (existing.recordset.length > 0) {
                // Already liked, maybe unlike?
                return { success: false, message: 'Post already liked' };
            }

            const insertQuery = `
                INSERT INTO Likes (UserId, PostId)
                VALUES (@UserId, @PostId)
            `;
            await request.query(insertQuery);

            const updateQuery = `
                UPDATE Posts
                SET LikeCount = LikeCount + 1
                WHERE Id = @PostId
            `;
            await request.query(updateQuery);

            return { success: true, message: 'Post liked successfully' };
        } catch (err) {
            console.error('likePost error:', err);
            return { success: false, message: 'Failed to like post' };
        }
    }

    static async savePost(userId, postId) {
        try {
            const request = Database.getRequest();

            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);
            Database.addInput(request, 'PostId', sql.Int, postId);

            const checkQuery = `SELECT Id FROM SavedPosts WHERE UserId = @UserId AND PostId = @PostId`;
            const existing = await request.query(checkQuery);
            if (existing.recordset.length > 0) {
                return { success: false, message: 'Post already saved' };
            }

            const insertQuery = `
                INSERT INTO SavedPosts (UserId, PostId)
                VALUES (@UserId, @PostId)
            `;
            await request.query(insertQuery);

            return { success: true, message: 'Post saved successfully' };
        } catch (err) {
            console.error('savePost error:', err);
            return { success: false, message: 'Failed to save post' };
        }
    }

    static async sharePost(postId) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'PostId', sql.Int, postId);

            const updateQuery = `
                UPDATE Posts
                SET ShareCount = ShareCount + 1
                WHERE Id = @PostId
            `;
            await request.query(updateQuery);

            return { success: true, message: 'Post shared successfully' };
        } catch (err) {
            console.error('sharePost error:', err);
            return { success: false, message: 'Failed to share post' };
        }
    }
}

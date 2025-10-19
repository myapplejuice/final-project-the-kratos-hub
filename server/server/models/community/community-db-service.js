import sql from 'mssql/msnodesqlv8.js';
import Database from '../database/database.js';
import ObjectMapper from '../../utils/object-mapper.js';

export default class CommunityDBService {
    static async fetchPostById(userId, postId) {
        try {
            const request = Database.getRequest();

            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);
            Database.addInput(request, 'PostId', sql.Int, postId);

            const query = `
            SELECT p.*,
                   u.Id AS UserId, u.Firstname, u.Lastname, u.ImageURL,
                   t.IsVerified, t.TrainerStatus,
                   CASE WHEN l.Id IS NOT NULL THEN 1 ELSE 0 END AS IsLikedByUser,
                   CASE WHEN s.Id IS NOT NULL THEN 1 ELSE 0 END AS IsSavedByUser
            FROM Posts p
            INNER JOIN Users u ON u.Id = p.UserId
            LEFT JOIN UserTrainerProfile t ON t.UserId = u.Id
            LEFT JOIN Likes l ON l.PostId = p.Id AND l.UserId = @UserId
            LEFT JOIN SavedPosts s ON s.PostId = p.Id AND s.UserId = @UserId
            WHERE p.Id = @PostId;
        `;

            const result = await request.query(query);

            if (!result.recordset.length) return null;

            const row = result.recordset[0];
            const mappedRow = {};
            for (const key in row) {
                let value = row[key];

                if (key.toLowerCase() === 'imagesurls') {
                    try {
                        value = value ? JSON.parse(value) : [];
                    } catch {
                        value = [];
                    }
                }

                mappedRow[ObjectMapper.toCamelCase(key)] = value;
            }

            const post = {
                id: mappedRow.id,
                postUser: {
                    id: Array.isArray(mappedRow.userId) ? mappedRow.userId[0] : mappedRow.userId,
                    firstname: mappedRow.firstname,
                    lastname: mappedRow.lastname,
                    imageURL: mappedRow.imageURL,
                    trainerProfile: {
                        trainerStatus: mappedRow.trainerStatus || 'inactive',
                        isVerified: !!mappedRow.isVerified,
                    },
                },
                imagesURLS: mappedRow.imagesURLS || [],
                caption: mappedRow.caption || '',
                likeCount: Array.isArray(mappedRow.likeCount)
                    ? mappedRow.likeCount.reduce((a, b) => a + b, 0)
                    : mappedRow.likeCount || 0,
                shareCount: Array.isArray(mappedRow.shareCount)
                    ? mappedRow.shareCount.reduce((a, b) => a + b, 0)
                    : mappedRow.shareCount || 0,
                dateOfCreation: mappedRow.dateOfCreation,
                topic: mappedRow.topic || '',
                isLikedByUser: !!mappedRow.isLikedByUser,
                isSavedByUser: !!mappedRow.isSavedByUser,
            };

            return post;

        } catch (err) {
            console.error('fetchPostById error:', err);
            return null;
        }
    }


    static async fetchPosts(forUser = false, userId, page = 1, pageSize = 10, topic = null) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);
            Database.addInput(request, 'Offset', sql.Int, (page - 1) * pageSize);
            Database.addInput(request, 'PageSize', sql.Int, pageSize);

            let query = `
            SELECT p.*,
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

            if (topic) {
                Database.addInput(request, 'Topic', sql.VarChar(20), topic);
                query += ` AND p.Topic = @Topic`;
            }

            query += `
            ORDER BY p.Id DESC
            OFFSET @Offset ROWS
            FETCH NEXT @PageSize ROWS ONLY;
        `;

            const result = await request.query(query);

            const posts = result.recordset.map(row => {
                // Use camelCase keys
                const mappedRow = {};
                for (const key in row) {
                    let value = row[key];

                    // Fix ImagesURLS to be an array
                    if (key.toLowerCase() === 'imagesurls') {
                        try {
                            value = value ? JSON.parse(value) : [];
                        } catch {
                            value = [];
                        }
                    }

                    mappedRow[ObjectMapper.toCamelCase(key)] = value;
                }

                return {
                    id: mappedRow.id,
                    postUser: {
                        id: Array.isArray(mappedRow.userId) ? mappedRow.userId[0] : mappedRow.userId,
                        firstname: mappedRow.firstname,
                        lastname: mappedRow.lastname,
                        imageURL: mappedRow.imageURL,
                        trainerProfile: {
                            trainerStatus: mappedRow.trainerStatus || 'inactive',
                            isVerified: !!mappedRow.isVerified,
                        },
                    },
                    imagesURLS: mappedRow.imagesURLS || [],
                    caption: mappedRow.caption || '',
                    likeCount: Array.isArray(mappedRow.likeCount)
                        ? mappedRow.likeCount.reduce((a, b) => a + b, 0)
                        : mappedRow.likeCount || 0,
                    shareCount: Array.isArray(mappedRow.shareCount)
                        ? mappedRow.shareCount.reduce((a, b) => a + b, 0)
                        : mappedRow.shareCount || 0,
                    dateOfCreation: mappedRow.dateOfCreation,
                    topic: mappedRow.topic || '',
                    isLikedByUser: !!mappedRow.isLikedByUser,
                    isSavedByUser: !!mappedRow.isSavedByUser,
                };
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
            Database.addInput(request, 'DateOfCreation', sql.DateTime2, new Date());
            Database.addInput(request, 'Topic', sql.VarChar(20), details.topic || '');

            const insertQuery = `
                INSERT INTO Posts (UserId, ImagesURLS, Caption, DateOfCreation, Topic)
                OUTPUT inserted.Id
                VALUES (@UserId, @ImagesURLS, @Caption, @DateOfCreation, @Topic)
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
            Database.addInput(request, 'Topic', sql.VarChar(20), details.topic || '');

            const updateQuery = `
                UPDATE Posts
                SET ImagesURLS = @ImagesURLS,
                    Caption = @Caption,
                    Topic = @Topic
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

            const checkQuery = `SELECT Id FROM Likes WHERE UserId = @UserId AND PostId = @PostId`;
            const existing = await request.query(checkQuery);

            if (existing.recordset.length > 0) {
                const deleteQuery = `DELETE FROM Likes WHERE UserId = @UserId AND PostId = @PostId`;
                await request.query(deleteQuery);

                const decrementQuery = `
                UPDATE Posts
                SET LikeCount = CASE WHEN LikeCount > 0 THEN LikeCount - 1 ELSE 0 END
                WHERE Id = @PostId
            `;
                await request.query(decrementQuery);

                return { success: true, liked: false, message: 'Post unliked successfully' };
            } else {
                const insertQuery = `INSERT INTO Likes (UserId, PostId) VALUES (@UserId, @PostId)`;
                await request.query(insertQuery);

                const incrementQuery = `UPDATE Posts SET LikeCount = LikeCount + 1 WHERE Id = @PostId`;
                await request.query(incrementQuery);

                return { success: true, liked: true, message: 'Post liked successfully' };
            }
        } catch (err) {
            console.error('toggleLikePost error:', err);
            return { success: false, message: 'Failed to toggle like' };
        }
    }

    static async savePost(userId, postId) {
        try {
            const request = Database.getRequest();

            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);
            Database.addInput(request, 'PostId', sql.Int, postId);

            const checkQuery = `
            SELECT Id 
            FROM SavedPosts 
            WHERE UserId = @UserId AND PostId = @PostId
        `;
            const existing = await request.query(checkQuery);

            if (existing.recordset.length > 0) {
                // Post is already saved → unsave it
                const deleteQuery = `
                DELETE FROM SavedPosts 
                WHERE UserId = @UserId AND PostId = @PostId
            `;
                await request.query(deleteQuery);
                return { success: true, message: 'Post unsaved', isSaved: false };
            } else {
                // Post not saved → save it
                const insertQuery = `
                INSERT INTO SavedPosts (UserId, PostId)
                VALUES (@UserId, @PostId)
            `;
                await request.query(insertQuery);
                return { success: true, message: 'Post saved', isSaved: true };
            }
        } catch (err) {
            console.error('savePost error:', err);
            return { success: false, message: 'Failed to toggle save status' };
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

    static async fetchPostLikers(postId) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'PostId', sql.Int, postId);

            const query = `
            SELECT 
                u.Id,
                u.Firstname,
                u.Lastname,
                u.ImageURL,
                u.Gender,
                u.Age
            FROM Users u
            INNER JOIN Likes l ON u.Id = l.UserId
            WHERE l.PostId = @PostId
        `;

            const result = await request.query(query);

            return {
                success: true,
                message: 'Post likers fetched successfully',
                likers: result.recordset.map(liker => ({
                    id: liker.Id,
                    firstname: liker.Firstname,
                    lastname: liker.Lastname,
                    imageURL: liker.ImageURL,
                    gender: liker.Gender,
                    age: liker.Age
                }))
            };
        } catch (err) {
            console.error('fetchPostLikers error:', err);
            return { success: false, message: 'Failed to fetch post likers' };
        }
    }

    static async fetchUserSavedPosts(userId, page = 1, pageSize = 10) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);
            Database.addInput(request, 'Offset', sql.Int, (page - 1) * pageSize);
            Database.addInput(request, 'PageSize', sql.Int, pageSize);

            const query = `
            SELECT 
                p.*,
                u.Id AS UserId, 
                u.Firstname, 
                u.Lastname, 
                u.ImageURL,
                t.IsVerified, 
                t.TrainerStatus,
                CASE WHEN l.Id IS NOT NULL THEN 1 ELSE 0 END AS IsLikedByUser,
                1 AS IsSavedByUser
            FROM SavedPosts s
            INNER JOIN Posts p ON s.PostId = p.Id
            INNER JOIN Users u ON u.Id = p.UserId
            LEFT JOIN UserTrainerProfile t ON t.UserId = u.Id
            LEFT JOIN Likes l ON l.PostId = p.Id AND l.UserId = @UserId
            WHERE s.UserId = @UserId
            ORDER BY p.Id DESC
            OFFSET @Offset ROWS
            FETCH NEXT @PageSize ROWS ONLY;
        `;

            const result = await request.query(query);

            const posts = result.recordset.map(row => {
                const mappedRow = {};
                for (const key in row) {
                    let value = row[key];
                    if (key.toLowerCase() === 'imagesurls') {
                        try {
                            value = value ? JSON.parse(value) : [];
                        } catch {
                            value = [];
                        }
                    }
                    mappedRow[ObjectMapper.toCamelCase(key)] = value;
                }

                return {
                    id: mappedRow.id,
                    postUser: {
                        id: Array.isArray(mappedRow.userId) ? mappedRow.userId[0] : mappedRow.userId,
                        firstname: mappedRow.firstname,
                        lastname: mappedRow.lastname,
                        imageURL: mappedRow.imageURL,
                        trainerProfile: {
                            trainerStatus: mappedRow.trainerStatus || 'inactive',
                            isVerified: !!mappedRow.isVerified,
                        },
                    },
                    imagesURLS: mappedRow.imagesURLS || [],
                    caption: mappedRow.caption || '',
                    likeCount: Array.isArray(mappedRow.likeCount)
                        ? mappedRow.likeCount.reduce((a, b) => a + b, 0)
                        : mappedRow.likeCount || 0,
                    shareCount: Array.isArray(mappedRow.shareCount)
                        ? mappedRow.shareCount.reduce((a, b) => a + b, 0)
                        : mappedRow.shareCount || 0,
                    dateOfCreation: mappedRow.dateOfCreation,
                    topic: mappedRow.topic || '',
                    isLikedByUser: !!mappedRow.isLikedByUser,
                    isSavedByUser: !!mappedRow.isSavedByUser,
                };
            });

            return {
                success: true,
                posts,
                page,
                hasMore: posts.length === pageSize,
            };
        } catch (err) {
            console.error('fetchUserSavedPosts error:', err);
            return { success: false, posts: [], page, hasMore: false, message: 'Failed to fetch saved posts' };
        }
    }
}

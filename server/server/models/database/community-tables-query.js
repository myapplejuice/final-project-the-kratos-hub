export function communityTablesQuery() {
    const postsQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Posts' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.Posts (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                UserId UNIQUEIDENTIFIER NOT NULL,
                
                ImagesURLS NVARCHAR(MAX) NULL DEFAULT '[]',
                Caption NVARCHAR(MAX) NULL DEFAULT '',
                DateOfCreation DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                Topic VARCHAR(20) NOT NULL,

                LikeCount INT NOT NULL DEFAULT 0,
                ShareCount INT NOT NULL DEFAULT 0,

                CONSTRAINT FK_Posts_Users FOREIGN KEY (UserId)
                    REFERENCES dbo.Users(Id)
                    ON DELETE CASCADE
            );
        END;`;

    const likesQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Likes' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.Likes (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                PostId INT NOT NULL,
                UserId UNIQUEIDENTIFIER NOT NULL,

                CONSTRAINT FK_Likes_Posts FOREIGN KEY (PostId)
                    REFERENCES dbo.Posts(Id)
                    ON DELETE CASCADE,
                CONSTRAINT FK_Likes_Users FOREIGN KEY (UserId)
                    REFERENCES dbo.Users(Id),
                CONSTRAINT UQ_Likes UNIQUE (PostId, UserId)
            );
        END;`;

    const savedPostsQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SavedPosts' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.SavedPosts (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                PostId INT NOT NULL,
                UserId UNIQUEIDENTIFIER NOT NULL,

                CONSTRAINT FK_SavedPosts_Posts FOREIGN KEY (PostId)
                    REFERENCES dbo.Posts(Id)
                    ON DELETE CASCADE,
                CONSTRAINT FK_SavedPosts_Users FOREIGN KEY (UserId)
                    REFERENCES dbo.Users(Id),
                CONSTRAINT UQ_SavedPosts UNIQUE (PostId, UserId)
            );
        END;`;

    const query = [
        postsQuery,
        likesQuery,
        savedPostsQuery
    ].map(q => q.trim()).join('\n\n');

    return query;
}

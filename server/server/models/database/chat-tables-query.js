export function chatTablesQuery() {
    const chatRoomsQuery = `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ChatRooms' AND xtype='U')
            BEGIN
                CREATE TABLE dbo.ChatRooms (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    DateOfCreation DATETIME2 NOT NULL
                );
            END;`

    const userChatRoomsQuery = `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserChatRooms' AND xtype='U')
            BEGIN
                CREATE TABLE dbo.UserChatRooms (
                    UserId UNIQUEIDENTIFIER NOT NULL,
                    ChatRoomId INT NOT NULL,
                    PRIMARY KEY (UserId, ChatRoomId),
                    CONSTRAINT FK_UserChatRooms_Users FOREIGN KEY (UserId)
                        REFERENCES dbo.Users(Id),
                    CONSTRAINT FK_UserChatRooms_ChatRooms FOREIGN KEY (ChatRoomId)
                        REFERENCES dbo.ChatRooms(Id)
                        ON DELETE CASCADE
                );
            END;`

    const messagesQuery = `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Messages' AND xtype='U')
            BEGIN
                CREATE TABLE dbo.Messages (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    SenderId UNIQUEIDENTIFIER NOT NULL,
                    ChatRoomId INT NOT NULL,
                    Message NVARCHAR(MAX) NOT NULL,
                    ExtraInformation VARCHAR(300) NULL, --JSON, a json listing things like image references and app stuff like meal plans ids to reference to the chat
                    DateTimeSent DATETIME2 NOT NULL,
                    CONSTRAINT FK_Messages_Users FOREIGN KEY (SenderId)
                        REFERENCES dbo.Users(Id),
                    CONSTRAINT FK_Messages_ChatRooms FOREIGN KEY (ChatRoomId)
                        REFERENCES dbo.ChatRooms(Id)
                        ON DELETE CASCADE
                );
            END;`

    const messageSeenQuery = `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MessageSeen' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.MessageSeen (
                MessageId INT NOT NULL,
                UserId UNIQUEIDENTIFIER NOT NULL,
                SeenAt DATETIME2 NOT NULL DEFAULT GETDATE(),
                PRIMARY KEY (MessageId, UserId),
                CONSTRAINT FK_MessageSeen_Message FOREIGN KEY (MessageId)
                    REFERENCES dbo.Messages(Id)
                    ON DELETE CASCADE,
                CONSTRAINT FK_MessageSeen_User FOREIGN KEY (UserId)
                    REFERENCES dbo.Users(Id)
            );
        END;`;

    const query = [
        chatRoomsQuery, userChatRoomsQuery, messagesQuery, messageSeenQuery
    ].map(q => q.trim()).join('\n\n');

    return query;
}
export function userTablesQuery() {
    const userQuery = `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
            BEGIN
                CREATE TABLE dbo.Users (
                    Id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
                    DateOfCreation DATETIME2 NOT NULL,
                    Firstname VARCHAR(50) NOT NULL,
                    Lastname VARCHAR(50) NOT NULL,
                    Age INT NOT NULL,
                    Gender VARCHAR(20) NOT NULL,
                    Email VARCHAR(50) NOT NULL UNIQUE,
                    Phone VARCHAR(50) NOT NULL UNIQUE,
                    Password VARCHAR(512) NOT NULL,
                    ImageBase64 VARCHAR(MAX) NULL
                );
            END;`

    const userNotificationsQuery = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserNotifications' AND xtype='U')
            BEGIN
                CREATE TABLE dbo.UserNotifications (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    UserId UNIQUEIDENTIFIER NOT NULL,
                    Notification VARCHAR(500) NOT NULL,
                    ExtraInformation VARCHAR(MAX) NULL, --JSON String
                    Seen BIT NOT NULL DEFAULT 0,
                    DateOfCreation DATETIME2 NOT NULL,
                    CONSTRAINT FK_UserNotifications_Users FOREIGN KEY (UserId)
                        REFERENCES dbo.Users(Id)
                        ON DELETE CASCADE
                );
            END;`

    const userFriendListQuery = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FriendRequests' AND xtype='U')
            BEGIN
                CREATE TABLE dbo.FriendRequests (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    AdderId UNIQUEIDENTIFIER NOT NULL,
                    ReceiverId UNIQUEIDENTIFIER NOT NULL,
                    Status VARCHAR(20) NOT NULL DEFAULT 'pending',
                    Description VARCHAR(500) NULL,
                    DateOfCreation DATETIME2 NOT NULL,
                    CONSTRAINT UQ_FriendRequests UNIQUE (AdderId, ReceiverId),
                    CONSTRAINT FK_FriendRequests_Adder FOREIGN KEY (AdderId)
                        REFERENCES dbo.Users(Id)
                        ON DELETE NO ACTION,
                    CONSTRAINT FK_FriendRequests_Receiver FOREIGN KEY (ReceiverId)
                        REFERENCES dbo.Users(Id)
                        ON DELETE NO ACTION
                );
            END;

            IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_FriendRequests_Delete')
                BEGIN
                    EXEC('
                        CREATE TRIGGER TR_FriendRequests_Delete
                        ON dbo.Users
                        AFTER DELETE
                        AS
                        BEGIN
                            DELETE FROM dbo.FriendRequests
                            WHERE AdderId IN (SELECT Id FROM DELETED)
                               OR ReceiverId IN (SELECT Id FROM DELETED);
                        END
                    ')
                END;

            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserFriendList' AND xtype='U')
            BEGIN
                CREATE TABLE dbo.UserFriendList (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    UserOne UNIQUEIDENTIFIER NOT NULL,
                    UserTwo UNIQUEIDENTIFIER NOT NULL,
                    Status VARCHAR(20) NOT NULL,
                    -- enforce consistent order to prevent symmetric duplicates
                    CONSTRAINT CK_UserFriendList_Order CHECK (UserOne < UserTwo),
                    CONSTRAINT UQ_UserFriendList UNIQUE (UserOne, UserTwo),
                    CONSTRAINT FK_UserFriendList_UserOne FOREIGN KEY (UserOne)
                        REFERENCES dbo.Users(Id)
                        ON DELETE NO ACTION,
                    CONSTRAINT FK_UserFriendList_UserTwo FOREIGN KEY (UserTwo)
                        REFERENCES dbo.Users(Id)
                        ON DELETE NO ACTION
                );
            END;
        
            -- Trigger to delete friendships where deleted user is in either column
            IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_UserFriendList_Delete')
            BEGIN
                EXEC('
                    CREATE TRIGGER TR_UserFriendList_Delete
                    ON dbo.Users
                    AFTER DELETE
                    AS
                    BEGIN
                        DELETE FROM dbo.UserFriendList
                        WHERE UserOne IN (SELECT Id FROM DELETED)
                           OR UserTwo IN (SELECT Id FROM DELETED);
                    END
                ')
            END;`

    const metricsQuery = `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserMetrics' AND xtype='U')
            BEGIN
                CREATE TABLE dbo.UserMetrics (
                    UserId UNIQUEIDENTIFIER PRIMARY KEY,
                    HeightCm DECIMAL(5,2) DEFAULT 0,
                    WeightKg DECIMAL(5,2) DEFAULT 0,
                    BMI DECIMAL(4,1) DEFAULT 0,
                    BMR INT DEFAULT 0,
                    TDEE INT DEFAULT 0,
                    BodyFat DECIMAL(4,1) DEFAULT 0,
                    LeanBodyMass DECIMAL(5,2) DEFAULT 0,
                    ActivityLevel VARCHAR(20),
                    CONSTRAINT FK_UserMetrics_User FOREIGN KEY (UserId)
                        REFERENCES dbo.Users(Id)
                        ON DELETE CASCADE
                );
            END;`

    const nutritionQuery = `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserNutrition' AND xtype='U')
            BEGIN
                CREATE TABLE dbo.UserNutrition (
                    UserId UNIQUEIDENTIFIER PRIMARY KEY,
                    Goal VARCHAR(20),
                    RecommendedEnergyKcal INT DEFAULT 0,
                    SetEnergyKcal INT DEFAULT 0,
                    WaterMl DECIMAL(6,1) DEFAULT 0,
                    Diet VARCHAR(50),
                    ProteinRequirement DECIMAL(6,2) DEFAULT 0,
                    CarbRate DECIMAL(5,2) DEFAULT 0,
                    ProteinRate DECIMAL(5,2) DEFAULT 0,
                    FatRate DECIMAL(5,2) DEFAULT 0,
                    CarbGrams DECIMAL(6,2) DEFAULT 0,
                    ProteinGrams DECIMAL(6,2) DEFAULT 0,
                    FatGrams DECIMAL(6,2) DEFAULT 0,
                    CONSTRAINT FK_UserNutrition_User FOREIGN KEY (UserId)
                        REFERENCES dbo.Users(Id)
                        ON DELETE CASCADE
                );
            END;`

    const profileHistoryQuery = `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserProfileHistory' AND xtype='U')
            BEGIN
                CREATE TABLE dbo.UserProfileHistory (
                    HistoryId UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
                    UserId UNIQUEIDENTIFIER,
                    Firstname VARCHAR(50) NULL,
                    Lastname VARCHAR(50) NULL,
                    Age INT NULL,
                    Gender VARCHAR(20) NULL,
                    Email VARCHAR(50) NULL,
                    Phone VARCHAR(50) NULL,
                    ChangedFields VARCHAR(500) NOT NULL,
                    DateOfUpdate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                    CONSTRAINT FK_UsersProfileHistory_User FOREIGN KEY (UserId)
                        REFERENCES dbo.Users(Id)
                        ON DELETE CASCADE
                );
            END;`

    const metricsHistoryQuery = `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserMetricsHistory' AND xtype='U')
            BEGIN
                CREATE TABLE dbo.UserMetricsHistory (
                    HistoryId UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
                    UserId UNIQUEIDENTIFIER,
                    HeightCm DECIMAL(5,2) NULL,
                    WeightKg DECIMAL(5,2) NULL,
                    BMI DECIMAL(4,1) NULL,
                    BMR INT NULL,
                    TDEE INT NULL,
                    BodyFat DECIMAL(4,1) NULL,
                    LeanBodyMass DECIMAL(5,2) NULL,
                    ActivityLevel VARCHAR(20) NULL,
                    ChangedFields VARCHAR(500) NOT NULL,
                    DateOfUpdate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                    CONSTRAINT FK_UsersMetricsHistory_User FOREIGN KEY (UserId)
                        REFERENCES dbo.Users(Id)
                        ON DELETE CASCADE
                );
            END;`

    const nutritionHistoryQuery = `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserNutritionHistory' AND xtype='U')
            BEGIN
                CREATE TABLE dbo.UserNutritionHistory (
                    HistoryId UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
                    UserId UNIQUEIDENTIFIER,
                    Goal VARCHAR(20) NULL,
                    RecommendedEnergyKcal INT NULL,
                    SetEnergyKcal INT NULL,
                    WaterMl DECIMAL(6,1) NULL,
                    Diet VARCHAR(50) NULL,
                    CarbRate DECIMAL(5,2) NULL,
                    ProteinRate DECIMAL(5,2) NULL,
                    ProteinRequirement DECIMAL(6,2) NULL,
                    FatRate DECIMAL(5,2) NULL,
                    CarbGrams DECIMAL(6,2) NULL,
                    ProteinGrams DECIMAL(6,2) NULL,
                    FatGrams DECIMAL(6,2) NULL,
                    ChangedFields VARCHAR(500) NOT NULL,
                    DateOfUpdate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                    CONSTRAINT FK_UsersNutritionHistory_User FOREIGN KEY (UserId)
                        REFERENCES dbo.Users(Id)
                        ON DELETE CASCADE
                );
            END;`

    const query = [
        userQuery,
        userNotificationsQuery,
        userFriendListQuery,
        metricsQuery,
        nutritionQuery,
        profileHistoryQuery,
        metricsHistoryQuery,
        nutritionHistoryQuery
    ].map(q => q.trim()).join('\n');

    return query;
}
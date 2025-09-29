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
                    Password VARCHAR(256) NOT NULL,
                    ImageBase64 VARCHAR(MAX) NULL
                );
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
        metricsQuery,
        nutritionQuery,
        profileHistoryQuery,
        metricsHistoryQuery,
        nutritionHistoryQuery
    ].map(q => q.trim()).join('\n');

    return query;
}
export function nutritionTablesQuery() {
    const nutritionDayQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserNutritionLogs' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.UserNutritionLogs (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                UserId UNIQUEIDENTIFIER NOT NULL,
                Date DATETIME2 NOT NULL,

                Goal VARCHAR(20) NOT NULL,
                Diet VARCHAR(50) NOT NULL,
                CarbRate DECIMAL(5,2) NOT NULL,
                ProteinRate DECIMAL(5,2) NOT NULL,
                FatRate DECIMAL(5,2) NOT NULL,
                ProteinRequirement DECIMAL(6,2) NOT NULL,
                    
                TargetEnergyKcal DECIMAL(7,2) NOT NULL,
                TargetCarbGrams DECIMAL(7,2) NOT NULL,
                TargetProteinGrams DECIMAL(7,2) NOT NULL,
                TargetFatGrams DECIMAL(7,2) NOT NULL,
                TargetWaterMl DECIMAL(6,1) NOT NULL,

                ConsumedEnergyKcal DECIMAL(7,2) NOT NULL DEFAULT 0,
                ConsumedCarbGrams DECIMAL(7,2) NOT NULL DEFAULT 0,
                ConsumedProteinGrams DECIMAL(7,2) NOT NULL DEFAULT 0,
                ConsumedFatGrams DECIMAL(7,2) NOT NULL DEFAULT 0,
                ConsumedWaterMl DECIMAL(6,1) NOT NULL DEFAULT 0,

                CONSTRAINT FK_NutritionLogs_User FOREIGN KEY (UserId)
                    REFERENCES dbo.Users(Id)
                    ON DELETE CASCADE
            );
        END;`;

    const mealLogQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MealLog' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.MealLog (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                NutritionLogId INT NOT NULL,
                Label VARCHAR(50) NOT NULL,
                Time TIME NOT NULL,
                CONSTRAINT FK_MealLog_NutritionLog FOREIGN KEY (NutritionLogId)
                    REFERENCES dbo.UserNutritionLogs(Id)
                    ON DELETE CASCADE
            );
        END;`;

    const mealLogFoodsQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MealLogFoods' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.MealLogFoods (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                MealLogId INT NOT NULL,
                Creator VARCHAR(50) NOT NULL,

                Label VARCHAR(100) NOT NULL,
                Type VARCHAR(20) NOT NULL, 
                ServingAmount DECIMAL(7,2) NOT NULL,

                EnergyKcal DECIMAL(7,2) NOT NULL,
                Carbs DECIMAL(7,2) NOT NULL,
                Protein DECIMAL(7,2) NOT NULL,
                Fat DECIMAL(7,2) NOT NULL,

                CONSTRAINT FK_MealLogFoods_MealLog FOREIGN KEY (MealLogId)
                    REFERENCES dbo.MealLog(Id)
                    ON DELETE CASCADE
            );
        END;`;

    const userFoodsQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UserFoods' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.UserFoods (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                CreatorId UNIQUEIDENTIFIER NOT NULL,
                CreatorName VARCHAR(100) NOT NULL,
                IsPublic BIT NOT NULL,

                Label VARCHAR(50) NOT NULL,
                Type VARCHAR(50) NOT NULL,
                ServingUnit VARCHAR(20) NOT NULL,
                ServingSize DECIMAL(7,2) NOT NULL,
                
                EnergyKcal DECIMAL(7,2) NOT NULL DEFAULT 0,
                Carbs DECIMAL(7,2) NOT NULL DEFAULT 0,
                Protein DECIMAL(7,2) NOT NULL DEFAULT 0,
                Fat DECIMAL(7,2) NOT NULL DEFAULT 0,
                DominantMacro VARCHAR(20) NOT NULL DEFAULT 0,
                AdditionalProps NVARCHAR(MAX) NULL, -- store JSON string
                
                CONSTRAINT FK_UserFoods_User FOREIGN KEY (CreatorId)
                    REFERENCES dbo.Users(Id)
                    ON DELETE CASCADE
            );
        END;`;

    const query = [nutritionDayQuery, mealLogQuery, mealLogFoodsQuery, userFoodsQuery]
        .map(q => q.trim())
        .join('\n\n');

    return query;
}
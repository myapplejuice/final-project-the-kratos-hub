export function nutritionTablesQuery() {
    const nutritionLogsQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='NutritionLogs' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.NutritionLogs (
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
                ConsumedWaterMl DECIMAL(6,1) NOT NULL DEFAULT 0,

                CONSTRAINT FK_NutritionLogs_Users FOREIGN KEY (UserId)
                    REFERENCES dbo.Users(Id)
                    ON DELETE CASCADE
            );
        END;`;

    const mealLogsQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MealLogs' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.MealLogs (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                NutritionLogId INT NOT NULL,
                Label VARCHAR(50) NOT NULL,
                Time TIME,
                CONSTRAINT FK_MealLogs_NutritionLogs FOREIGN KEY (NutritionLogId)
                    REFERENCES dbo.NutritionLogs(Id)
                    ON DELETE CASCADE
            );
        END;`;

    const mealLogsFoodsQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MealLogsFoods' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.MealLogsFoods (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                MealLogId INT NOT NULL,
                
                OwnerId UNIQUEIDENTIFIER NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
                CreatorId UNIQUEIDENTIFIER NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
                CreatorName VARCHAR(100) NOT NULL DEFAULT 'Unknown',
                USDAId INT NOT NULL DEFAULT -1,
                IsPublic BIT NOT NULL DEFAULT 0,
                IsUSDA BIT NOT NULL DEFAULT 0,

                Label VARCHAR(50) NOT NULL,
                Category VARCHAR(50) NOT NULL,

                ServingUnit VARCHAR(20) NOT NULL,
                OriginalServingSize DECIMAL(7,2) NOT NULL,
                ServingSize DECIMAL(7,2) NOT NULL,
                OriginalEnergyKcal DECIMAL(7,2) NOT NULL DEFAULT 0,
                OriginalCarbs DECIMAL(7,2) NOT NULL DEFAULT 0,
                OriginalProtein DECIMAL(7,2) NOT NULL DEFAULT 0,
                OriginalFat DECIMAL(7,2) NOT NULL DEFAULT 0,
                EnergyKcal DECIMAL(7,2) NOT NULL DEFAULT 0,
                Carbs DECIMAL(7,2) NOT NULL DEFAULT 0,
                Protein DECIMAL(7,2) NOT NULL DEFAULT 0,
                Fat DECIMAL(7,2) NOT NULL DEFAULT 0,
                DominantMacro VARCHAR(20) NOT NULL DEFAULT '',
                AdditionalProps NVARCHAR(MAX) NULL, -- store JSON string

                CONSTRAINT FK_MealLogsFoods_MealLogs FOREIGN KEY (MealLogId)
                    REFERENCES dbo.MealLogs(Id)
                    ON DELETE CASCADE
            );
        END;`;

    const foodsQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Foods' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.Foods (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                
                OwnerId UNIQUEIDENTIFIER NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
                CreatorId UNIQUEIDENTIFIER NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
                CreatorName VARCHAR(100) NOT NULL DEFAULT 'Unknown',
                USDAId INT NOT NULL DEFAULT -1,
                IsPublic BIT NOT NULL DEFAULT 0,
                IsUSDA BIT NOT NULL DEFAULT 0,

                Label VARCHAR(50) NOT NULL,
                Category VARCHAR(50) NOT NULL,
                
                ServingUnit VARCHAR(20) NOT NULL,
                ServingSize DECIMAL(7,2) NOT NULL,
                EnergyKcal DECIMAL(7,2) NOT NULL DEFAULT 0,
                Carbs DECIMAL(7,2) NOT NULL DEFAULT 0,
                Protein DECIMAL(7,2) NOT NULL DEFAULT 0,
                Fat DECIMAL(7,2) NOT NULL DEFAULT 0,
                DominantMacro VARCHAR(20) NOT NULL DEFAULT '',
                AdditionalProps NVARCHAR(MAX) NULL, -- store JSON string
                
                CONSTRAINT FK_Foods_Users FOREIGN KEY (OwnerId)
                    REFERENCES dbo.Users(Id)
                    ON DELETE CASCADE
            );
        END;`;

    const mealPlansQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MealPlans' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.MealPlans (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                UserId UNIQUEIDENTIFIER NOT NULL,
                DateOfCreation DATETIME2 NOT NULL,
                IsCreatedByCoach BIT NOT NULL DEFAULT 0,
                CoachId UNIQUEIDENTIFIER,

                Label VARCHAR(50) NOT NULL,
                Description VARCHAR(400) NOT NULL DEFAULT 'No description provided',

                CONSTRAINT FK_MealPlans_UserId FOREIGN KEY (UserId)
                    REFERENCES dbo.Users(Id)
                    ON DELETE CASCADE,

                CONSTRAINT FK_MealPlans_CoachId FOREIGN KEY (CoachId)
                    REFERENCES dbo.Users(Id)
            );
        END;`;

    const mealPlansMealsQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MealPlansMeals' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.MealPlansMeals (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                MealPlanId INT NOT NULL,
                Label VARCHAR(50) NOT NULL,
                Time TIME,
                CONSTRAINT FK_MealPlansMeals_MealPlans FOREIGN KEY (MealPlanId)
                    REFERENCES dbo.MealPlans(Id)
                    ON DELETE CASCADE
            );
        END;`;

    const mealPlansMealsFoodsQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MealPlansMealsFoods' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.MealPlansMealsFoods (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                MealId INT NOT NULL,
                
                OwnerId UNIQUEIDENTIFIER NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
                CreatorId UNIQUEIDENTIFIER NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
                CreatorName VARCHAR(100) NOT NULL DEFAULT 'Unknown',
                USDAId INT NOT NULL DEFAULT -1,
                IsUSDA BIT NOT NULL DEFAULT 0,

                Label VARCHAR(50) NOT NULL,
                Category VARCHAR(50) NOT NULL,

                ServingUnit VARCHAR(20) NOT NULL,
                OriginalServingSize DECIMAL(7,2) NOT NULL,
                ServingSize DECIMAL(7,2) NOT NULL,
                OriginalEnergyKcal DECIMAL(7,2) NOT NULL DEFAULT 0,
                OriginalCarbs DECIMAL(7,2) NOT NULL DEFAULT 0,
                OriginalProtein DECIMAL(7,2) NOT NULL DEFAULT 0,
                OriginalFat DECIMAL(7,2) NOT NULL DEFAULT 0,
                EnergyKcal DECIMAL(7,2) NOT NULL DEFAULT 0,
                Carbs DECIMAL(7,2) NOT NULL DEFAULT 0,
                Protein DECIMAL(7,2) NOT NULL DEFAULT 0,
                Fat DECIMAL(7,2) NOT NULL DEFAULT 0,
                DominantMacro VARCHAR(20) NOT NULL DEFAULT '',
                AdditionalProps NVARCHAR(MAX) NULL, -- store JSON string

                CONSTRAINT FK_MealPlansMealsFoods_MealPlansMeals FOREIGN KEY (MealId)
                    REFERENCES dbo.MealPlansMeals(Id)
                    ON DELETE CASCADE
            );
        END;`;

    const query = [
        nutritionLogsQuery,
        mealLogsQuery,
        mealLogsFoodsQuery,
        foodsQuery,
        mealPlansQuery,
        mealPlansMealsQuery,
        mealPlansMealsFoodsQuery
    ].map(q => q.trim()).join('\n\n');

    return query;
}

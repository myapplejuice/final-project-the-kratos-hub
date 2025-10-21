export function trainingQuery() {
    const exercisesQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Exercises' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.Exercises (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                UserId UNIQUEIDENTIFIER NOT NULL,
                
                Date DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                Exercise NVARCHAR(MAX) NULL DEFAULT '[]',
                Sets NVARCHAR(MAX) NULL DEFAULT '[]', 

                CONSTRAINT FK_Exercises_Users FOREIGN KEY (UserId)
                    REFERENCES dbo.Users(Id)
                    ON DELETE CASCADE
            );
        END;`   ;

    const workoutsQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Workouts' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.Workouts (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                UserId UNIQUEIDENTIFIER NOT NULL,

                Date DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                Label NVARCHAR(MAX) NULL DEFAULT NULL,
                Description NVARCHAR(MAX) NULL DEFAULT NULL,
                
                Intensity NVARCHAR(MAX) NULL DEFAULT NULL,
                Duration NVARCHAR(MAX) NULL DEFAULT NULL,

                CONSTRAINT FK_Workouts_Users FOREIGN KEY (UserId)
                    REFERENCES dbo.Users(Id)
                    ON DELETE CASCADE
            );
        END;` ;

    const workoutsExercisesQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='WorkoutsExercises' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.WorkoutsExercises (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                UserId UNIQUEIDENTIFIER NOT NULL,
                WorkoutId INT NOT NULL,

                Exercise NVARCHAR(MAX) NULL DEFAULT '[]',
                Sets NVARCHAR(MAX) NULL DEFAULT '[]', 

                CONSTRAINT FK_WorkoutsExercises_Users FOREIGN KEY (UserId)
                    REFERENCES dbo.Users(Id),
                CONSTRAINT FK_WorkoutsExercises_Workouts FOREIGN KEY (WorkoutId)
                    REFERENCES dbo.Workouts(Id)
                    ON DELETE CASCADE
            );
        END;`;


    const query = [
        exercisesQuery,
        workoutsQuery,
        workoutsExercisesQuery
    ].map(q => q.trim()).join('\n\n');

    return query;
}

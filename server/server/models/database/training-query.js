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
        END;`
        ;

    const query = [
       exercisesQuery
    ].map(q => q.trim()).join('\n\n');

    return query;
}

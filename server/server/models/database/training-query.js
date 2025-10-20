export function trainingQuery() {
    const exercisesQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='VerificationApplications' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.VerificationApplications (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                UserId UNIQUEIDENTIFIER NOT NULL,
                
                Date DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                Label VARCHAR(100) NOT NULL DEFAULT '',
                Description VARCHAR(1000) NOT NULL DEFAULT '',
                BodyPart VARCHAR(100) NOT NULL DEFAULT '',
                Image NVARCHAR(MAX) NULL DEFAULT '',
                
                Sets NVARCHAR(MAX) NULL DEFAULT '[]', --JSON containing [{reps: 10, weight: 10}, {reps: 10, weight: 10}]

                CONSTRAINT FK_VerificationApplications_Users FOREIGN KEY (UserId)
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

export function adminQuery() {
    //DO ADMING QUERY FOR ADMIN TABLE WITH PERMISSONS... AND ALL THE STUFF


    const verificationApplications = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='VerificationApplications' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.VerificationApplications (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                UserId UNIQUEIDENTIFIER NOT NULL,
                Status VARCHAR(20) NOT NULL DEFAULT 'pending',
                
                Summary VARCHAR(1000) NOT NULL,
                Education VARCHAR(1000) NOT NULL,
                Images NVARCHAR(MAX) NULL DEFAULT '[]',
                Links NVARCHAR(MAX) NULL DEFAULT '[]',

                CONSTRAINT FK_VerificationApplications_Users FOREIGN KEY (UserId)
                    REFERENCES dbo.Users(Id)
                    ON DELETE CASCADE
            );
        END;`;

    const query = [
        verificationApplications
    ].map(q => q.trim()).join('\n\n');

    return query;
}

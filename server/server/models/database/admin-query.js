import PasswordHasher from "../../utils/password-hasher.js";
const pass = await PasswordHasher.hashPassword('Joker525252');

export function adminQuery() {
    const admins = ` IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Admins' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.Admins (
                Id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
                AccessId NVARCHAR(20) NOT NULL UNIQUE,
                AccessPassword NVARCHAR(512) NOT NULL,
                DateOfCreation DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
                Permissions NVARCHAR(MAX) NULL DEFAULT '[]',
                IsActive BIT NOT NULL DEFAULT 0,
                IsSeed BIT NOT NULL DEFAULT 0,

                CONSTRAINT UQ_AccessId UNIQUE (AccessId)
            );
        END;
        
          IF NOT EXISTS (SELECT 1 FROM dbo.Admins WHERE IsSeed = 1)
        BEGIN
            DECLARE @AccessId NVARCHAR(20) = 'XXXXXX';
            DECLARE @AccessPassword NVARCHAR(512) = '${pass}';
            DECLARE @DateOfCreation DATETIME2 = SYSUTCDATETIME();
            DECLARE @Permissions NVARCHAR(MAX) = '["all"]';
            DECLARE @IsActive BIT = 1;
            DECLARE @IsSeed BIT = 1;

            INSERT INTO dbo.Admins (
                AccessId, AccessPassword, DateOfCreation, Permissions, IsActive, IsSeed
            )
            VALUES (
                @AccessId, @AccessPassword, @DateOfCreation, @Permissions, @IsActive, @IsSeed
            );
        END;
        `;

    const verificationApplications = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='VerificationApplications' AND xtype='U')
        BEGIN
            CREATE TABLE dbo.VerificationApplications (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                UserId UNIQUEIDENTIFIER NOT NULL,
                Status VARCHAR(20) NOT NULL DEFAULT 'pending',
                DateOfCreation DATETIME2 NOT NULL,
                
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
        verificationApplications,
        admins
    ].map(q => q.trim()).join('\n\n');

    return query;
}

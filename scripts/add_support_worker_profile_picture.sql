USE ndis_portal_db;
GO

IF COL_LENGTH('support_workers', 'profile_picture') IS NULL
BEGIN
    ALTER TABLE support_workers
    ADD profile_picture NVARCHAR(500) NULL;
    PRINT 'Added profile_picture column.';
END
ELSE
    PRINT 'profile_picture column already exists.';
GO

USE ndis_portal_db;
GO

IF COL_LENGTH('support_workers', 'status') IS NULL
BEGIN
    ALTER TABLE support_workers
    ADD status NVARCHAR(20) NOT NULL
        CONSTRAINT DF_support_workers_status DEFAULT 'Active';
END
GO

UPDATE support_workers
SET status = 'Active'
WHERE status IS NULL OR LTRIM(RTRIM(status)) = '';
GO

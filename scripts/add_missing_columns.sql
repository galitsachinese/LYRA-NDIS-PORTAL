-- Add employment_type column if missing
IF COL_LENGTH('support_workers', 'employment_type') IS NULL
BEGIN
    ALTER TABLE support_workers ADD employment_type NVARCHAR(50) NOT NULL DEFAULT 'Casual';
    PRINT 'Added employment_type column.';
END
ELSE
    PRINT 'employment_type column already exists.';
GO

-- Add wwcc_expiry_date column if missing
IF COL_LENGTH('support_workers', 'wwcc_expiry_date') IS NULL
BEGIN
    ALTER TABLE support_workers ADD wwcc_expiry_date DATETIME NULL;
    PRINT 'Added wwcc_expiry_date column.';
END
ELSE
    PRINT 'wwcc_expiry_date column already exists.';
GO
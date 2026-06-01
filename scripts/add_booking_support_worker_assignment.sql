USE ndis_portal_db;
GO

IF COL_LENGTH('bookings', 'support_worker_id') IS NULL
BEGIN
    ALTER TABLE bookings
    ADD support_worker_id INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_bookings_support_worker'
)
BEGIN
    ALTER TABLE bookings
    ADD CONSTRAINT FK_bookings_support_worker
    FOREIGN KEY (support_worker_id)
    REFERENCES support_workers(id)
    ON DELETE SET NULL;
END
GO

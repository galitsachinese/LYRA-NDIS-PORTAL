-- Create 'contact_inquiries' table if missing
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'contact_inquiries')
BEGIN
    CREATE TABLE contact_inquiries (
        id INT PRIMARY KEY IDENTITY(1,1),
        first_name NVARCHAR(100) NOT NULL,
        last_name NVARCHAR(100) NOT NULL,
        email NVARCHAR(150) NOT NULL,
        phone_number NVARCHAR(20) NULL,
        message NVARCHAR(1000) NOT NULL,
        is_read BIT DEFAULT 0,
        submitted_at DATETIME DEFAULT GETDATE()
    );
    PRINT 'Created contact_inquiries table.';
END
ELSE
    PRINT 'contact_inquiries table already exists.';
GO

-- Create 'worker_bookings' table if missing
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'worker_bookings')
BEGIN
    CREATE TABLE worker_bookings (
        id INT PRIMARY KEY IDENTITY(1,1),
        worker_id INT NOT NULL,
        booking_id INT NOT NULL,
        assigned_date DATETIME NOT NULL DEFAULT GETDATE(),
        modified_date DATETIME NOT NULL DEFAULT GETDATE(),
        assigned_by INT NOT NULL,
        CONSTRAINT UQ_worker_bookings_booking UNIQUE (booking_id),
        CONSTRAINT FK_worker_bookings_worker FOREIGN KEY (worker_id) REFERENCES support_workers(id),
        CONSTRAINT FK_worker_bookings_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
        CONSTRAINT FK_worker_bookings_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id)
    );
    PRINT 'Created worker_bookings table.';
END
ELSE
    PRINT 'worker_bookings table already exists.';
GO
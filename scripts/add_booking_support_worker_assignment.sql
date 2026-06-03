USE ndis_portal_db;
GO

IF OBJECT_ID('worker_bookings', 'U') IS NULL
BEGIN
    CREATE TABLE worker_bookings (
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        worker_id INT NOT NULL,
        booking_id INT NOT NULL,
        assigned_date DATETIME NOT NULL CONSTRAINT DF_worker_bookings_assigned_date DEFAULT GETDATE(),
        modified_date DATETIME NOT NULL CONSTRAINT DF_worker_bookings_modified_date DEFAULT GETDATE(),
        assigned_by INT NOT NULL,
        CONSTRAINT UQ_worker_bookings_booking UNIQUE (booking_id),
        CONSTRAINT FK_worker_bookings_worker
            FOREIGN KEY (worker_id) REFERENCES support_workers(id),
        CONSTRAINT FK_worker_bookings_booking
            FOREIGN KEY (booking_id) REFERENCES bookings(id),
        CONSTRAINT FK_worker_bookings_assigned_by
            FOREIGN KEY (assigned_by) REFERENCES users(id)
    );
END
GO

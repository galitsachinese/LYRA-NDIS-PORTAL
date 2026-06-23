USE ndis_portal_db;
GO
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS category_count FROM service_categories;
SELECT COUNT(*) AS service_count FROM services;
SELECT COUNT(*) AS booking_count FROM bookings;
GO
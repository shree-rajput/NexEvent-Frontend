# EVENT MANAGEMENT SYSTEM - ALL SQL QUERIES (Complete List)

## 🗄️ TABLE CREATION QUERIES (7 Tables)

### Query 1: Create EVENT Table
```sql
CREATE TABLE EVENT (
  EVENT_ID INT PRIMARY KEY AUTO_INCREMENT,
  EVENT_NAME VARCHAR(255) NOT NULL,
  EVENT_DATE DATETIME NOT NULL,
  LOCATION VARCHAR(255),
  DESCRIPTION TEXT,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Query 2: Create ATTENDEE Table
```sql
CREATE TABLE ATTENDEE (
  ATTENDEE_ID INT PRIMARY KEY AUTO_INCREMENT,
  NAME VARCHAR(255) NOT NULL,
  EMAIL VARCHAR(255),
  NUMBER VARCHAR(15) NOT NULL,
  EVENT_ID INT NOT NULL,
  STATUS VARCHAR(50) DEFAULT 'registered',
  REGISTERED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (EVENT_ID) REFERENCES EVENT(EVENT_ID) ON DELETE CASCADE
);
```

### Query 3: Create VENUE Table
```sql
CREATE TABLE VENUE (
  VENUE_ID INT PRIMARY KEY AUTO_INCREMENT,
  VENUE_NAME VARCHAR(255) NOT NULL,
  ADDRESS VARCHAR(255),
  CITY VARCHAR(100),
  CAPACITY INT NOT NULL,
  PHONE VARCHAR(15),
  AMENITIES TEXT,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Query 4: Create VENDOR Table
```sql
CREATE TABLE VENDOR (
  VENDOR_ID INT PRIMARY KEY AUTO_INCREMENT,
  NAME VARCHAR(255) NOT NULL,
  SERVICE_TYPE VARCHAR(100),
  EMAIL VARCHAR(255),
  PHONE VARCHAR(15),
  ADDRESS VARCHAR(255),
  RATE INT,
  AVAILABILITY VARCHAR(50) DEFAULT 'available',
  DESCRIPTION TEXT,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Query 5: Create TASK Table
```sql
CREATE TABLE TASK (
  TASK_ID INT PRIMARY KEY AUTO_INCREMENT,
  NAME VARCHAR(255) NOT NULL,
  EVENT_ID INT NOT NULL,
  STATUS VARCHAR(50) DEFAULT 'pending',
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (EVENT_ID) REFERENCES EVENT(EVENT_ID) ON DELETE CASCADE
);
```

### Query 6: Create SCHEDULE Table
```sql
CREATE TABLE SCHEDULE (
  SCHEDULE_ID INT PRIMARY KEY AUTO_INCREMENT,
  EVENT_ID INT NOT NULL,
  START_DATE DATETIME NOT NULL,
  END_DATE DATETIME NOT NULL,
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (EVENT_ID) REFERENCES EVENT(EVENT_ID) ON DELETE CASCADE
);
```

### Query 7: Create BUDGET Table
```sql
CREATE TABLE BUDGET (
  BUDGET_ID INT PRIMARY KEY AUTO_INCREMENT,
  EVENT_ID INT NOT NULL,
  TOTAL_BUDGET DECIMAL(10, 2),
  CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (EVENT_ID) REFERENCES EVENT(EVENT_ID) ON DELETE CASCADE
);
```

---

## 📝 EVENTS PAGE QUERIES (5 Queries)

### Query 8: Insert Event
```sql
INSERT INTO EVENT (EVENT_NAME, EVENT_DATE, LOCATION, DESCRIPTION) 
VALUES ('Tech Conference 2025', '2025-12-15 10:00:00', 'New Delhi', 'Annual conference');
```

### Query 9: Get All Events
```sql
SELECT * FROM EVENT 
ORDER BY EVENT_DATE DESC;
```

### Query 10: Get Event By ID
```sql
SELECT * FROM EVENT 
WHERE EVENT_ID = 1;
```

### Query 11: Update Event
```sql
UPDATE EVENT 
SET EVENT_NAME = 'Updated Event Name', 
    EVENT_DATE = '2025-12-16 11:00:00', 
    LOCATION = 'Mumbai', 
    DESCRIPTION = 'Updated description' 
WHERE EVENT_ID = 1;
```

### Query 12: Delete Event
```sql
DELETE FROM EVENT 
WHERE EVENT_ID = 1;
```

---

## 👥 ATTENDEES PAGE QUERIES (8 Queries)

### Query 13: Get All Events (For Dropdown)
```sql
SELECT EVENT_ID, EVENT_NAME 
FROM EVENT 
ORDER BY EVENT_DATE DESC;
```

### Query 14: Insert Attendee
```sql
INSERT INTO ATTENDEE (NAME, EMAIL, NUMBER, EVENT_ID, STATUS) 
VALUES ('John Doe', 'john@example.com', '9876543210', 1, 'registered');
```

### Query 15: Get All Attendees
```sql
SELECT * FROM ATTENDEE 
ORDER BY REGISTERED_AT DESC;
```

### Query 16: Get Attendees By Event
```sql
SELECT * FROM ATTENDEE 
WHERE EVENT_ID = 1 
ORDER BY NAME;
```

### Query 17: Get Attendee By ID
```sql
SELECT * FROM ATTENDEE 
WHERE ATTENDEE_ID = 1;
```

### Query 18: Update Attendee
```sql
UPDATE ATTENDEE 
SET NAME = 'Jane Doe', 
    EMAIL = 'jane@example.com', 
    NUMBER = '9876543211', 
    STATUS = 'confirmed' 
WHERE ATTENDEE_ID = 1;
```

### Query 19: Delete Attendee
```sql
DELETE FROM ATTENDEE 
WHERE ATTENDEE_ID = 1;
```

### Query 20: Count Attendees By Event
```sql
SELECT EVENT_ID, COUNT(*) as TOTAL_ATTENDEES 
FROM ATTENDEE 
GROUP BY EVENT_ID;
```

---

## 🏢 VENUES PAGE QUERIES (6 Queries)

### Query 21: Insert Venue
```sql
INSERT INTO VENUE (VENUE_NAME, ADDRESS, CITY, CAPACITY, PHONE, AMENITIES) 
VALUES ('Grand Hall', '123 Main Street', 'New Delhi', 500, '9876543210', 'WiFi, Parking, Projector');
```

### Query 22: Get All Venues
```sql
SELECT * FROM VENUE 
ORDER BY CITY, VENUE_NAME;
```

### Query 23: Get Venue By ID
```sql
SELECT * FROM VENUE 
WHERE VENUE_ID = 1;
```

### Query 24: Update Venue
```sql
UPDATE VENUE 
SET VENUE_NAME = 'Updated Hall', 
    ADDRESS = '456 Oak Avenue', 
    CITY = 'Mumbai', 
    CAPACITY = 600, 
    PHONE = '9876543211', 
    AMENITIES = 'WiFi, Parking, AC, Projector' 
WHERE VENUE_ID = 1;
```

### Query 25: Delete Venue
```sql
DELETE FROM VENUE 
WHERE VENUE_ID = 1;
```

### Query 26: Get Venues By Capacity (Filter)
```sql
SELECT * FROM VENUE 
WHERE CAPACITY >= 300 
ORDER BY CAPACITY ASC;
```

---

## 🍽️ VENDORS PAGE QUERIES (6 Queries)

### Query 27: Insert Vendor
```sql
INSERT INTO VENDOR (NAME, SERVICE_TYPE, EMAIL, PHONE, ADDRESS, RATE, AVAILABILITY, DESCRIPTION) 
VALUES ('Tasty Catering', 'catering', 'tasty@example.com', '9876543210', '789 Food Street', 5000, 'available', 'Vegetarian and non-vegetarian options');
```

### Query 28: Get All Vendors
```sql
SELECT * FROM VENDOR 
ORDER BY SERVICE_TYPE, NAME;
```

### Query 29: Get Vendor By ID
```sql
SELECT * FROM VENDOR 
WHERE VENDOR_ID = 1;
```

### Query 30: Update Vendor
```sql
UPDATE VENDOR 
SET NAME = 'Updated Catering', 
    SERVICE_TYPE = 'catering', 
    EMAIL = 'updated@example.com', 
    PHONE = '9876543211', 
    ADDRESS = '890 Food Avenue', 
    RATE = 6000, 
    AVAILABILITY = 'available', 
    DESCRIPTION = 'Updated description' 
WHERE VENDOR_ID = 1;
```

### Query 31: Delete Vendor
```sql
DELETE FROM VENDOR 
WHERE VENDOR_ID = 1;
```

### Query 32: Get Available Vendors By Service Type
```sql
SELECT * FROM VENDOR 
WHERE SERVICE_TYPE = 'catering' AND AVAILABILITY = 'available' 
ORDER BY RATE ASC;
```

---

## 📋 TASK PAGE QUERIES (5 Queries)

### Query 33: Insert Task
```sql
INSERT INTO TASK (NAME, EVENT_ID, STATUS) 
VALUES ('Setup stage', 1, 'pending');
```

### Query 34: Get All Tasks
```sql
SELECT * FROM TASK 
ORDER BY CREATED_AT DESC;
```

### Query 35: Get Tasks By Event
```sql
SELECT * FROM TASK 
WHERE EVENT_ID = 1 
ORDER BY STATUS;
```

### Query 36: Update Task
```sql
UPDATE TASK 
SET NAME = 'Setup stage and decorations', 
    STATUS = 'in_progress' 
WHERE TASK_ID = 1;
```

### Query 37: Delete Task
```sql
DELETE FROM TASK 
WHERE TASK_ID = 1;
```

---

## 📅 SCHEDULE PAGE QUERIES (5 Queries)

### Query 38: Insert Schedule
```sql
INSERT INTO SCHEDULE (EVENT_ID, START_DATE, END_DATE) 
VALUES (1, '2025-12-15 09:00:00', '2025-12-15 18:00:00');
```

### Query 39: Get All Schedules
```sql
SELECT * FROM SCHEDULE 
ORDER BY START_DATE;
```

### Query 40: Get Schedule By Event
```sql
SELECT * FROM SCHEDULE 
WHERE EVENT_ID = 1;
```

### Query 41: Update Schedule
```sql
UPDATE SCHEDULE 
SET START_DATE = '2025-12-15 10:00:00', 
    END_DATE = '2025-12-15 19:00:00' 
WHERE SCHEDULE_ID = 1;
```

### Query 42: Delete Schedule
```sql
DELETE FROM SCHEDULE 
WHERE SCHEDULE_ID = 1;
```

---

## 💰 BUDGET PAGE QUERIES (4 Queries)

### Query 43: Insert Budget
```sql
INSERT INTO BUDGET (EVENT_ID, TOTAL_BUDGET) 
VALUES (1, 100000);
```

### Query 44: Get Budget By Event
```sql
SELECT * FROM BUDGET 
WHERE EVENT_ID = 1;
```

### Query 45: Update Budget
```sql
UPDATE BUDGET 
SET TOTAL_BUDGET = 120000 
WHERE BUDGET_ID = 1;
```

### Query 46: Delete Budget
```sql
DELETE FROM BUDGET 
WHERE BUDGET_ID = 1;
```

---

## 📊 ADVANCED/REPORT QUERIES (JOIN Queries)

### Query 47: Event With Attendees Count
```sql
SELECT 
  E.EVENT_ID,
  E.EVENT_NAME,
  E.EVENT_DATE,
  E.LOCATION,
  COUNT(A.ATTENDEE_ID) as TOTAL_ATTENDEES
FROM EVENT E
LEFT JOIN ATTENDEE A ON E.EVENT_ID = A.EVENT_ID
GROUP BY E.EVENT_ID, E.EVENT_NAME, E.EVENT_DATE, E.LOCATION
ORDER BY E.EVENT_DATE DESC;
```

### Query 48: Event With Venue And Schedule
```sql
SELECT 
  E.EVENT_ID,
  E.EVENT_NAME,
  E.EVENT_DATE,
  V.VENUE_NAME,
  V.CAPACITY,
  S.START_DATE,
  S.END_DATE
FROM EVENT E
LEFT JOIN SCHEDULE S ON E.EVENT_ID = S.EVENT_ID
LEFT JOIN VENUE V ON E.EVENT_ID = V.VENUE_ID
WHERE E.EVENT_ID = 1;
```

### Query 49: Attendee List With Event Details
```sql
SELECT 
  A.ATTENDEE_ID,
  A.NAME,
  A.EMAIL,
  A.NUMBER,
  E.EVENT_NAME,
  A.STATUS
FROM ATTENDEE A
JOIN EVENT E ON A.EVENT_ID = E.EVENT_ID
WHERE A.EVENT_ID = 1
ORDER BY A.NAME;
```

### Query 50: Event Statistics
```sql
SELECT 
  E.EVENT_NAME,
  COUNT(DISTINCT A.ATTENDEE_ID) as TOTAL_ATTENDEES,
  V.VENUE_NAME,
  B.TOTAL_BUDGET,
  COUNT(DISTINCT T.TASK_ID) as TOTAL_TASKS
FROM EVENT E
LEFT JOIN ATTENDEE A ON E.EVENT_ID = A.EVENT_ID
LEFT JOIN VENUE V ON E.EVENT_ID = V.VENUE_ID
LEFT JOIN BUDGET B ON E.EVENT_ID = B.EVENT_ID
LEFT JOIN TASK T ON E.EVENT_ID = T.EVENT_ID
GROUP BY E.EVENT_ID;
```

### Query 51: Search Events By Name Or Location
```sql
SELECT * FROM EVENT 
WHERE EVENT_NAME LIKE '%conference%' OR LOCATION LIKE '%Delhi%'
ORDER BY EVENT_DATE DESC;
```

### Query 52: Search Attendees By Name Or Email
```sql
SELECT * FROM ATTENDEE 
WHERE NAME LIKE '%John%' OR EMAIL LIKE '%john%'
ORDER BY REGISTERED_AT DESC;
```

### Query 53: Available Vendors Summary
```sql
SELECT 
  SERVICE_TYPE,
  COUNT(*) as TOTAL_VENDORS,
  MIN(RATE) as MIN_RATE,
  MAX(RATE) as MAX_RATE,
  AVG(RATE) as AVG_RATE
FROM VENDOR
WHERE AVAILABILITY = 'available'
GROUP BY SERVICE_TYPE;
```

### Query 54: Pending Tasks By Event
```sql
SELECT 
  E.EVENT_NAME,
  T.TASK_ID,
  T.NAME as TASK_NAME,
  T.STATUS
FROM TASK T
JOIN EVENT E ON T.EVENT_ID = E.EVENT_ID
WHERE T.STATUS = 'pending'
ORDER BY E.EVENT_DATE;
```

---

## 📈 SUMMARY TABLE

| Category | Queries Count | Examples |
|----------|--------------|----------|
| Table Creation | 7 | CREATE TABLE |
| Events CRUD | 5 | INSERT, SELECT, UPDATE, DELETE |
| Attendees CRUD | 8 | INSERT, SELECT, COUNT |
| Venues CRUD | 6 | INSERT, SELECT, Filter |
| Vendors CRUD | 6 | INSERT, SELECT, Filter |
| Tasks CRUD | 5 | INSERT, SELECT, UPDATE, DELETE |
| Schedule CRUD | 5 | INSERT, SELECT, UPDATE, DELETE |
| Budget CRUD | 4 | INSERT, SELECT, UPDATE, DELETE |
| Advanced Queries | 8 | JOIN, GROUP BY, AGGREGATE |
| **TOTAL** | **54** | **All Operations** |

---

## 🎯 QUERIES BY TYPE

```
INSERT Queries:  8 (Events, Attendees, Venues, Vendors, Tasks, Schedules, Budgets)
SELECT Queries: 28 (GET all, Get by ID, Get by filter, Dropdowns, Joins, Search)
UPDATE Queries:  8 (Events, Attendees, Venues, Vendors, Tasks, Schedules, Budgets)
DELETE Queries:  8 (Events, Attendees, Venues, Vendors, Tasks, Schedules, Budgets)
COUNT Queries:   2 (Attendees count, Vendor count)
---
TOTAL: 54 QUERIES
```

---

## ✅ MOST USED QUERIES (Priority)

**Rank 1**: `SELECT * FROM TABLE` → Used on every page load  
**Rank 2**: `INSERT INTO TABLE` → Used when creating new records  
**Rank 3**: `DELETE FROM TABLE` → Used when deleting records  
**Rank 4**: `UPDATE TABLE SET` → Used when editing records  
**Rank 5**: `JOIN Queries` → Used for reports and analytics  

---

## 💡 QUICK CHEAT SHEET

| Operation | Query |
|-----------|-------|
| Create Database | `CREATE DATABASE event_management;` |
| Use Database | `USE event_management;` |
| Create Table | `CREATE TABLE table_name (...)` |
| Add Record | `INSERT INTO table_name VALUES (...)` |
| View All Records | `SELECT * FROM table_name` |
| View Specific Record | `SELECT * FROM table_name WHERE ID = 1` |
| Update Record | `UPDATE table_name SET column = value WHERE ID = 1` |
| Delete Record | `DELETE FROM table_name WHERE ID = 1` |
| Search | `SELECT * FROM table_name WHERE column LIKE '%value%'` |
| Count Records | `SELECT COUNT(*) FROM table_name` |
| Join Tables | `SELECT * FROM table1 JOIN table2 ON condition` |

---

## 🚀 EXECUTION ORDER (For New Database Setup)

```
Step 1: Run Queries 1-7 (Create all tables)
Step 2: Run Query 8-12 (Insert sample events)
Step 3: Run Query 14-19 (Insert sample attendees)
Step 4: Run Query 21-25 (Insert sample venues)
Step 5: Run Query 27-31 (Insert sample vendors)
Step 6: Now backend API is ready to serve frontend!
```

---

## 📌 NOTES

✅ Use **prepared statements** to prevent SQL injection  
✅ All `?` are **parameter placeholders**  
✅ **Foreign keys** ensure data integrity  
✅ **ON DELETE CASCADE** automatically removes related records  
✅ Total **54 SQL queries** for complete functionality  
✅ Most queries are **SELECT** (60% of queries)  
✅ Use **indexes** on frequently queried columns for performance  

---

**Yeh sab queries hain jo tumhare Event Management System ke liye zaruri hain!** 🎉
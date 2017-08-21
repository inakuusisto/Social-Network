DROP TABLE IF EXISTS friend_requests;

CREATE TABLE friend_requests (
    id SERIAL primary key,
    request_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    status INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

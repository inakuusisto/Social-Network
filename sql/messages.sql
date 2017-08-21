DROP TABLE IF EXISTS messages;

CREATE TABLE messages (
    id SERIAL primary key,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

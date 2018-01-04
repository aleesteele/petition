DROP TABLE IF EXISTS user_profiles;

CREATE TABLE user_profiles(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    age INTEGER,
    city VARCHAR(200),
    country VARCHAR(200),
    url VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

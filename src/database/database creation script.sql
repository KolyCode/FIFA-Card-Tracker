-- SQLite3 schema (Django manages the database file; run via manage.py dbshell or sqlite3 CLI)
-- Enable foreign key support at runtime: PRAGMA foreign_keys = ON;

CREATE TABLE Players(
    id INTEGER PRIMARY KEY,
    sticker_number TEXT,
    player_name TEXT,
    team TEXT,
    position TEXT,
    birth_year INTEGER
);

CREATE TABLE Users(
    username TEXT PRIMARY KEY,
    account_password TEXT
);

CREATE TABLE UserCards(
    username TEXT NOT NULL,
    player_id INTEGER,
    PRIMARY KEY (username, player_id),
    FOREIGN KEY (username) REFERENCES Users(username),
    FOREIGN KEY (player_id) REFERENCES Players(id)
);
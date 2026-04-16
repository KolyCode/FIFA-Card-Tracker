-- returns true or false depending on whether or not the row exists
SELECT EXISTS(
    SELECT 1
    FROM UserCards
    WHERE username = 'insert_username' AND player_id = insert_player_id
);
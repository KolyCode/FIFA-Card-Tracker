SELECT Players.player_id, Players.player_name
FROM UserCards
JOIN Players ON UserCards.player_id = Players.id
WHERE UserCards.username = 'insert_username';
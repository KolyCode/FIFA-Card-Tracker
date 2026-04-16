from django.db import models


class Player(models.Model):
    id = models.IntegerField(primary_key=True)
    sticker_number = models.CharField(max_length=50, blank=True, null=True)
    player_name = models.CharField(max_length=255, blank=True, null=True)
    team = models.CharField(max_length=255, blank=True, null=True)
    position = models.CharField(max_length=50, blank=True, null=True)
    birth_year = models.IntegerField(blank=True, null=True)

    class Meta:
        db_table = 'players'

    def __str__(self):
        return self.player_name or str(self.id)


class User(models.Model):
    username = models.CharField(max_length=255, primary_key=True)
    account_password = models.CharField(max_length=255)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username


class UserCard(models.Model):
    username = models.ForeignKey(User, on_delete=models.CASCADE, db_column='username')
    player = models.ForeignKey(Player, on_delete=models.CASCADE)

    class Meta:
        db_table = 'usercards'
        unique_together = (('username', 'player'),)

    def __str__(self):
        return f"{self.username_id} - {self.player_id}"

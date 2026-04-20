from django.db import models
from django.contrib.auth.models import User as AuthUser


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


class UserCollection(models.Model):
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE, related_name='collection')
    player = models.ForeignKey(Player, on_delete=models.CASCADE)

    class Meta:
        unique_together = (('user', 'player'),)

    def __str__(self):
        return f"{self.user.username} - {self.player_id}"


class UserProfile(models.Model):
    user = models.OneToOneField(AuthUser, on_delete=models.CASCADE, related_name='profile')
    trade_banned = models.BooleanField(default=False)

    class Meta:
        db_table = 'user_profiles'

    def __str__(self):
        return f"Profile({self.user.username})"


class Group(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(AuthUser, on_delete=models.CASCADE, related_name='created_groups')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'groups'

    def __str__(self):
        return self.name


class GroupMembership(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(AuthUser, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_admin = models.BooleanField(default=False)

    class Meta:
        db_table = 'group_memberships'
        unique_together = (('group', 'user'),)

    def __str__(self):
        return f"{self.user.username} in {self.group.name} ({'admin' if self.is_admin else 'member'})"


class Trade(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_ACCEPTED = 'accepted'
    STATUS_DECLINED = 'declined'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_ACCEPTED, 'Accepted'),
        (STATUS_DECLINED, 'Declined'),
    ]

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='trades')
    from_user = models.ForeignKey(AuthUser, on_delete=models.CASCADE, related_name='trades_sent')
    to_user = models.ForeignKey(AuthUser, on_delete=models.CASCADE, related_name='trades_received')
    offered_player = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, related_name='trade_offers')
    requested_player = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, related_name='trade_requests')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'trades'


class GroupInvite(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_ACCEPTED = 'accepted'
    STATUS_DECLINED = 'declined'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_ACCEPTED, 'Accepted'),
        (STATUS_DECLINED, 'Declined'),
    ]

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='invites')
    invited_user = models.ForeignKey(AuthUser, on_delete=models.CASCADE, related_name='received_invites')
    invited_by = models.ForeignKey(AuthUser, on_delete=models.CASCADE, related_name='sent_invites')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'group_invites'
        unique_together = (('group', 'invited_user'),)

    def __str__(self):
        return f"{self.invited_user.username} invited to {self.group.name} by {self.invited_by.username}"
from django.http import HttpResponse
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import Player, UserCollection, Group, GroupMembership, GroupInvite, Trade, UserProfile


def home(request):
    return HttpResponse("The API says hello!")


@api_view(['POST'])
@permission_classes([AllowAny])
def auth_register(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    if not email or not password:
        return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=email).exists():
        return Response({'error': 'An account with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=email, email=email, password=password)
    return Response({'message': 'Account created. You can now log in.'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def auth_login(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    user = authenticate(request, username=email, password=password)
    if user is None:
        return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'email': user.email}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def auth_logout(request):
    request.user.auth_token.delete()
    return Response({'message': 'Logged out.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auth_me(request):
    profile = getattr(request.user, 'profile', None)
    return Response({
        'email': request.user.email,
        'id': request.user.id,
        'trade_banned': profile.trade_banned if profile else False,
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_collection(request):
    items = UserCollection.objects.filter(user=request.user).select_related('player')
    players = [
        {
            'sofifa_id': item.player.id,
            'player_name': item.player.player_name,
            'team': item.player.team,
            'position': item.player.position,
            'birth_year': item.player.birth_year,
            'sticker_number': item.player.sticker_number,
        }
        for item in items
    ]
    return Response(players, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_collection(request):
    player_id = request.data.get('player_id')
    if not player_id:
        return Response({'error': 'player_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        player = Player.objects.get(id=player_id)
    except Player.DoesNotExist:
        return Response({'error': 'Player not found.'}, status=status.HTTP_404_NOT_FOUND)
    UserCollection.objects.get_or_create(user=request.user, player=player)
    return Response({'message': 'Player added to collection.'}, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_collection(request, player_id):
    UserCollection.objects.filter(user=request.user, player_id=player_id).delete()
    return Response({'message': 'Player removed from collection.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_players(request):
    players = Player.objects.all().order_by('sticker_number')
    data = [
        {
            'sofifa_id': p.id,
            'sticker_number': p.sticker_number,
            'player_name': p.player_name,
            'team': p.team,
            'position': p.position,
            'birth_year': p.birth_year,
        }
        for p in players
    ]
    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_groups(request):
    memberships = GroupMembership.objects.filter(user=request.user).select_related('group', 'group__created_by')
    groups = []
    for membership in memberships:
        group = membership.group
        members = GroupMembership.objects.filter(group=group).select_related('user')
        member_data = [
            {
                'id': m.user.id,
                'username': m.user.username,
                'email': m.user.email,
                'is_admin': m.is_admin,
                'joined_at': m.joined_at,
                'trade_banned': getattr(m.user, 'profile', None) and m.user.profile.trade_banned or False,
            }
            for m in members
        ]
        groups.append({
            'id': group.id,
            'name': group.name,
            'description': group.description,
            'created_by': group.created_by.username,
            'created_at': group.created_at,
            'member_count': len(member_data),
            'is_admin': membership.is_admin,
            'members': member_data,
        })
    return Response(groups, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_group(request):
    name = request.data.get('name', '').strip()
    description = request.data.get('description', '').strip()

    if not name:
        return Response({'error': 'Group name is required.'}, status=status.HTTP_400_BAD_REQUEST)

    if Group.objects.filter(name=name).exists():
        return Response({'error': 'A group with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    group = Group.objects.create(name=name, description=description, created_by=request.user)
    GroupMembership.objects.create(group=group, user=request.user, is_admin=True)
    
    # Include members in the response
    members = GroupMembership.objects.filter(group=group).select_related('user')
    member_data = [
        {
            'id': m.user.id,
            'username': m.user.username,
            'email': m.user.email,
            'is_admin': m.is_admin,
            'joined_at': m.joined_at,
        }
        for m in members
    ]
    
    return Response({
        'id': group.id,
        'name': group.name,
        'description': group.description,
        'created_by': group.created_by.username,
        'created_at': group.created_at,
        'member_count': 1,
        'is_admin': True,
        'members': member_data,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_group(request):
    group_id = request.data.get('group_id')
    if not group_id:
        return Response({'error': 'group_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        group = Group.objects.get(id=group_id)
    except Group.DoesNotExist:
        return Response({'error': 'Group not found.'}, status=status.HTTP_404_NOT_FOUND)

    membership, created = GroupMembership.objects.get_or_create(group=group, user=request.user)
    if not created:
        return Response({'error': 'You are already a member of this group.'}, status=status.HTTP_400_BAD_REQUEST)

    members = GroupMembership.objects.filter(group=group).select_related('user')
    member_data = [
        {
            'id': m.user.id,
            'username': m.user.username,
            'email': m.user.email,
            'is_admin': m.is_admin,
            'joined_at': m.joined_at,
        }
        for m in members
    ]

    return Response({
        'id': group.id,
        'name': group.name,
        'description': group.description,
        'created_by': group.created_by.username,
        'created_at': group.created_at,
        'member_count': len(member_data),
        'is_admin': False,
        'members': member_data,
    }, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def leave_group(request, group_id):
    GroupMembership.objects.filter(group_id=group_id, user=request.user).delete()
    return Response({'message': 'Left the group.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invite_member(request):
    group_id = request.data.get('group_id')
    username = request.data.get('username', '').strip()

    if not group_id or not username:
        return Response({'error': 'group_id and username are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        group = Group.objects.get(id=group_id)
    except Group.DoesNotExist:
        return Response({'error': 'Group not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Check if requester is a member (admins only can invite)
    try:
        requester_membership = GroupMembership.objects.get(group=group, user=request.user)
        if not requester_membership.is_admin:
            return Response({'error': 'Only admins can invite members.'}, status=status.HTTP_403_FORBIDDEN)
    except GroupMembership.DoesNotExist:
        return Response({'error': 'You are not a member of this group.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        user_to_invite = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    if GroupMembership.objects.filter(group=group, user=user_to_invite).exists():
        return Response({'error': 'User is already a member of this group.'}, status=status.HTTP_400_BAD_REQUEST)

    invite, created = GroupInvite.objects.get_or_create(
        group=group,
        invited_user=user_to_invite,
        defaults={'invited_by': request.user, 'status': GroupInvite.STATUS_PENDING},
    )
    if not created:
        if invite.status == GroupInvite.STATUS_PENDING:
            return Response({'error': 'User has already been invited to this group.'}, status=status.HTTP_400_BAD_REQUEST)
        # Re-invite if previously declined
        invite.status = GroupInvite.STATUS_PENDING
        invite.invited_by = request.user
        invite.save()

    return Response({'message': f'Invitation sent to {username}.'}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_invites(request):
    invites = GroupInvite.objects.filter(
        invited_user=request.user,
        status=GroupInvite.STATUS_PENDING,
    ).select_related('group', 'invited_by')
    data = [
        {
            'id': invite.id,
            'group_id': invite.group.id,
            'group_name': invite.group.name,
            'invited_by': invite.invited_by.username,
            'created_at': invite.created_at,
        }
        for invite in invites
    ]
    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_to_invite(request, invite_id):
    action = request.data.get('action')  # 'accept' or 'decline'
    if action not in ('accept', 'decline'):
        return Response({'error': 'action must be "accept" or "decline".'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        invite = GroupInvite.objects.select_related('group').get(id=invite_id, invited_user=request.user)
    except GroupInvite.DoesNotExist:
        return Response({'error': 'Invite not found.'}, status=status.HTTP_404_NOT_FOUND)

    if invite.status != GroupInvite.STATUS_PENDING:
        return Response({'error': 'This invite has already been responded to.'}, status=status.HTTP_400_BAD_REQUEST)

    if action == 'accept':
        invite.status = GroupInvite.STATUS_ACCEPTED
        invite.save()
        GroupMembership.objects.get_or_create(group=invite.group, user=request.user)
        return Response({'message': f'You have joined {invite.group.name}.'}, status=status.HTTP_200_OK)
    else:
        invite.status = GroupInvite.STATUS_DECLINED
        invite.save()
        return Response({'message': 'Invite declined.'}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_member(request, group_id, user_id):
    try:
        group = Group.objects.get(id=group_id)
    except Group.DoesNotExist:
        return Response({'error': 'Group not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Check if requester is admin
    try:
        requester_membership = GroupMembership.objects.get(group=group, user=request.user)
        if not requester_membership.is_admin:
            return Response({'error': 'Only admins can remove members.'}, status=status.HTTP_403_FORBIDDEN)
    except GroupMembership.DoesNotExist:
        return Response({'error': 'You are not a member of this group.'}, status=status.HTTP_403_FORBIDDEN)

    if int(user_id) == request.user.id:
        return Response({'error': 'You cannot remove yourself from the group.'}, status=status.HTTP_400_BAD_REQUEST)

    deleted_count = GroupMembership.objects.filter(group=group, user_id=user_id).delete()
    if deleted_count[0] == 0:
        return Response({'error': 'User is not a member of this group.'}, status=status.HTTP_404_NOT_FOUND)

    return Response({'message': 'Removed member from the group.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def promote_admin(request):
    group_id = request.data.get('group_id')
    user_id = request.data.get('user_id')

    if not group_id or not user_id:
        return Response({'error': 'group_id and user_id are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        group = Group.objects.get(id=group_id)
    except Group.DoesNotExist:
        return Response({'error': 'Group not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Check if requester is admin
    try:
        requester_membership = GroupMembership.objects.get(group=group, user=request.user)
        if not requester_membership.is_admin:
            return Response({'error': 'Only admins can promote members.'}, status=status.HTTP_403_FORBIDDEN)
    except GroupMembership.DoesNotExist:
        return Response({'error': 'You are not a member of this group.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        membership = GroupMembership.objects.get(group=group, user_id=user_id)
    except GroupMembership.DoesNotExist:
        return Response({'error': 'User is not a member of this group.'}, status=status.HTTP_404_NOT_FOUND)

    if membership.is_admin:
        return Response({'error': 'User is already an admin.'}, status=status.HTTP_400_BAD_REQUEST)

    membership.is_admin = True
    membership.save()

    return Response({'message': 'User promoted to admin.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def demote_admin(request):
    group_id = request.data.get('group_id')
    user_id = request.data.get('user_id')

    if not group_id or not user_id:
        return Response({'error': 'group_id and user_id are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        group = Group.objects.get(id=group_id)
    except Group.DoesNotExist:
        return Response({'error': 'Group not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Check if requester is admin
    try:
        requester_membership = GroupMembership.objects.get(group=group, user=request.user)
        if not requester_membership.is_admin:
            return Response({'error': 'Only admins can demote admins.'}, status=status.HTTP_403_FORBIDDEN)
    except GroupMembership.DoesNotExist:
        return Response({'error': 'You are not a member of this group.'}, status=status.HTTP_403_FORBIDDEN)

    if int(user_id) == request.user.id:
        return Response({'error': 'You cannot demote yourself.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        membership = GroupMembership.objects.get(group=group, user_id=user_id)
    except GroupMembership.DoesNotExist:
        return Response({'error': 'User is not a member of this group.'}, status=status.HTTP_404_NOT_FOUND)

    if not membership.is_admin:
        return Response({'error': 'User is not an admin.'}, status=status.HTTP_400_BAD_REQUEST)

    membership.is_admin = False
    membership.save()

    return Response({'message': 'Admin demoted to member.'}, status=status.HTTP_200_OK)


# ==============================|| MODERATOR VIEWS ||============================== #

class IsStaffUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


@api_view(['POST'])
@permission_classes([AllowAny])
def mod_login(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if user is None or not user.is_staff:
        return Response({'error': 'Invalid credentials or not a moderator.'}, status=status.HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'username': user.username}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsStaffUser])
def mod_me(request):
    return Response({'username': request.user.username, 'is_staff': True}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsStaffUser])
def mod_get_all_groups(request):
    groups_qs = Group.objects.all().select_related('created_by').prefetch_related('memberships__user')
    data = []
    for group in groups_qs:
        members = [
            {'id': m.user.id, 'username': m.user.username, 'email': m.user.email, 'is_admin': m.is_admin}
            for m in group.memberships.all()
        ]
        data.append({
            'id': group.id,
            'name': group.name,
            'description': group.description,
            'created_by': group.created_by.username,
            'created_at': group.created_at,
            'member_count': len(members),
            'members': members,
        })
    return Response(data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsStaffUser])
def mod_delete_group(request, group_id):
    try:
        group = Group.objects.get(id=group_id)
    except Group.DoesNotExist:
        return Response({'error': 'Group not found.'}, status=status.HTTP_404_NOT_FOUND)
    group.delete()
    return Response({'message': 'Group deleted.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsStaffUser])
def mod_add_member(request):
    group_id = request.data.get('group_id')
    username = request.data.get('username', '').strip()

    if not group_id or not username:
        return Response({'error': 'group_id and username are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        group = Group.objects.get(id=group_id)
    except Group.DoesNotExist:
        return Response({'error': 'Group not found.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        user_to_add = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    membership, created = GroupMembership.objects.get_or_create(group=group, user=user_to_add)
    if not created:
        return Response({'error': 'User is already a member of this group.'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'message': f'Added {username} to the group.'}, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsStaffUser])
def mod_remove_member(request, group_id, user_id):
    deleted_count, _ = GroupMembership.objects.filter(group_id=group_id, user_id=user_id).delete()
    if deleted_count == 0:
        return Response({'error': 'User is not a member of this group.'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'message': 'Removed member from the group.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsStaffUser])
def mod_get_all_players(request):
    players = Player.objects.all().order_by('sticker_number')
    data = [
        {
            'id': p.id,
            'sticker_number': p.sticker_number,
            'player_name': p.player_name,
            'team': p.team,
            'position': p.position,
            'birth_year': p.birth_year,
        }
        for p in players
    ]
    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsStaffUser])
def mod_add_player(request):
    player_id = request.data.get('id')
    if not player_id:
        return Response({'error': 'id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    if Player.objects.filter(id=player_id).exists():
        return Response({'error': 'A player with this ID already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    player = Player.objects.create(
        id=player_id,
        sticker_number=request.data.get('sticker_number', ''),
        player_name=request.data.get('player_name', ''),
        team=request.data.get('team', ''),
        position=request.data.get('position', ''),
        birth_year=request.data.get('birth_year') or None,
    )
    return Response({
        'id': player.id,
        'sticker_number': player.sticker_number,
        'player_name': player.player_name,
        'team': player.team,
        'position': player.position,
        'birth_year': player.birth_year,
    }, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsStaffUser])
def mod_delete_player(request, player_id):
    try:
        player = Player.objects.get(id=player_id)
    except Player.DoesNotExist:
        return Response({'error': 'Player not found.'}, status=status.HTTP_404_NOT_FOUND)
    player.delete()  # CASCADE removes from UserCollection
    return Response({'message': 'Player deleted from database and all user galleries.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsStaffUser])
def mod_get_all_users(request):
    users = User.objects.filter(is_staff=False).order_by('email')
    data = []
    for u in users:
        profile = getattr(u, 'profile', None)
        data.append({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'date_joined': u.date_joined,
            'is_active': u.is_active,
            'trade_banned': profile.trade_banned if profile else False,
        })
    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsStaffUser])
def mod_set_trade_ban(request, user_id):
    banned = request.data.get('banned')
    if banned is None:
        return Response({'error': 'banned (bool) is required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        u = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    profile, _ = UserProfile.objects.get_or_create(user=u)
    profile.trade_banned = bool(banned)
    profile.save()
    state = 'banned from trading' if profile.trade_banned else 'allowed to trade'
    return Response({'message': f'{u.username} is now {state}.'}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsStaffUser])
def mod_delete_user(request, user_id):
    try:
        u = User.objects.get(id=user_id, is_staff=False)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    username = u.username
    u.delete()
    return Response({'message': f'User "{username}" deleted.'}, status=status.HTTP_200_OK)


# ==============================|| TRADE VIEWS ||============================== #

def _player_to_dict(player):
    if not player:
        return None
    return {
        'sofifa_id': player.id,
        'player_name': player.player_name,
        'team': player.team,
        'position': player.position,
        'sticker_number': player.sticker_number,
        'birth_year': player.birth_year,
    }


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_trade(request):
    group_id = request.data.get('group_id')
    to_user_id = request.data.get('to_user_id')
    offered_player_id = request.data.get('offered_player_id')
    requested_player_id = request.data.get('requested_player_id')

    if not all([group_id, to_user_id, offered_player_id, requested_player_id]):
        return Response({'error': 'group_id, to_user_id, offered_player_id, and requested_player_id are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if int(to_user_id) == request.user.id:
        return Response({'error': 'You cannot trade with yourself.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if either user is trade-banned
    proposer_profile = getattr(request.user, 'profile', None)
    if proposer_profile and proposer_profile.trade_banned:
        return Response({'error': 'You have been banned from trading.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        group = Group.objects.get(id=group_id)
    except Group.DoesNotExist:
        return Response({'error': 'Group not found.'}, status=status.HTTP_404_NOT_FOUND)

    if not GroupMembership.objects.filter(group=group, user=request.user).exists():
        return Response({'error': 'You are not a member of this group.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        to_user = User.objects.get(id=to_user_id)
    except User.DoesNotExist:
        return Response({'error': 'Target user not found.'}, status=status.HTTP_404_NOT_FOUND)

    to_user_profile = getattr(to_user, 'profile', None)
    if to_user_profile and to_user_profile.trade_banned:
        return Response({'error': 'That user has been banned from trading.'}, status=status.HTTP_403_FORBIDDEN)

    if not GroupMembership.objects.filter(group=group, user=to_user).exists():
        return Response({'error': 'Target user is not a member of this group.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        offered_player = Player.objects.get(id=offered_player_id)
    except Player.DoesNotExist:
        return Response({'error': 'Offered player not found.'}, status=status.HTTP_404_NOT_FOUND)

    if not UserCollection.objects.filter(user=request.user, player=offered_player).exists():
        return Response({'error': 'You do not own the player you are offering.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        requested_player = Player.objects.get(id=requested_player_id)
    except Player.DoesNotExist:
        return Response({'error': 'Requested player not found.'}, status=status.HTTP_404_NOT_FOUND)

    if not UserCollection.objects.filter(user=to_user, player=requested_player).exists():
        return Response({'error': 'The other user does not own the player you are requesting.'}, status=status.HTTP_400_BAD_REQUEST)

    trade = Trade.objects.create(
        group=group,
        from_user=request.user,
        to_user=to_user,
        offered_player=offered_player,
        requested_player=requested_player,
    )
    return Response({'id': trade.id, 'message': 'Trade offer sent.'}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_trades(request):
    incoming = Trade.objects.filter(
        to_user=request.user, status=Trade.STATUS_PENDING
    ).select_related('from_user', 'offered_player', 'requested_player', 'group')

    outgoing = Trade.objects.filter(
        from_user=request.user, status=Trade.STATUS_PENDING
    ).select_related('to_user', 'offered_player', 'requested_player', 'group')

    return Response({
        'incoming': [
            {
                'id': t.id,
                'from_user_id': t.from_user.id,
                'from_username': t.from_user.username,
                'offered_player': _player_to_dict(t.offered_player),
                'requested_player': _player_to_dict(t.requested_player),
                'group_id': t.group.id,
                'group_name': t.group.name,
                'created_at': t.created_at,
            }
            for t in incoming
        ],
        'outgoing': [
            {
                'id': t.id,
                'to_user_id': t.to_user.id,
                'to_username': t.to_user.username,
                'offered_player': _player_to_dict(t.offered_player),
                'requested_player': _player_to_dict(t.requested_player),
                'group_id': t.group.id,
                'group_name': t.group.name,
                'created_at': t.created_at,
            }
            for t in outgoing
        ],
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_to_trade(request, trade_id):
    action = request.data.get('action')
    if action not in ('accept', 'decline', 'counter'):
        return Response({'error': 'action must be accept, decline, or counter.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        trade = Trade.objects.select_related('from_user', 'to_user', 'offered_player', 'requested_player').get(
            id=trade_id, to_user=request.user, status=Trade.STATUS_PENDING
        )
    except Trade.DoesNotExist:
        return Response({'error': 'Trade not found or you are not the recipient.'}, status=status.HTTP_404_NOT_FOUND)

    if action == 'decline':
        trade.status = Trade.STATUS_DECLINED
        trade.save()
        return Response({'message': 'Trade declined.'}, status=status.HTTP_200_OK)

    if action == 'accept':
        # Block if either party is trade-banned
        from_profile = getattr(trade.from_user, 'profile', None)
        to_profile = getattr(trade.to_user, 'profile', None)
        if (from_profile and from_profile.trade_banned) or (to_profile and to_profile.trade_banned):
            trade.status = Trade.STATUS_DECLINED
            trade.save()
            return Response({'error': 'Trade cannot be completed because a participant has been banned from trading. Trade declined.'}, status=status.HTTP_403_FORBIDDEN)

        if not UserCollection.objects.filter(user=trade.from_user, player=trade.offered_player).exists():
            trade.status = Trade.STATUS_DECLINED
            trade.save()
            return Response({'error': 'The other user no longer owns the offered player. Trade declined.'}, status=status.HTTP_400_BAD_REQUEST)
        if not UserCollection.objects.filter(user=trade.to_user, player=trade.requested_player).exists():
            trade.status = Trade.STATUS_DECLINED
            trade.save()
            return Response({'error': 'You no longer own the requested player. Trade declined.'}, status=status.HTTP_400_BAD_REQUEST)
        # Swap the cards
        UserCollection.objects.filter(user=trade.from_user, player=trade.offered_player).delete()
        UserCollection.objects.get_or_create(user=trade.to_user, player=trade.offered_player)
        UserCollection.objects.filter(user=trade.to_user, player=trade.requested_player).delete()
        UserCollection.objects.get_or_create(user=trade.from_user, player=trade.requested_player)
        trade.status = Trade.STATUS_ACCEPTED
        trade.save()
        return Response({'message': 'Trade accepted! Cards have been swapped.'}, status=status.HTTP_200_OK)

    # counter — recipient picks a different card to offer; the original offered card stays as what they're requesting
    new_offered_id = request.data.get('offered_player_id')
    if not new_offered_id:
        return Response({'error': 'offered_player_id is required for a counter offer.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        new_offered = Player.objects.get(id=new_offered_id)
    except Player.DoesNotExist:
        return Response({'error': 'Offered player not found.'}, status=status.HTTP_404_NOT_FOUND)

    if not UserCollection.objects.filter(user=request.user, player=new_offered).exists():
        return Response({'error': 'You do not own the player you are offering.'}, status=status.HTTP_400_BAD_REQUEST)

    # The originally offered card becomes what the counter-er wants in return
    original_offered = trade.offered_player
    old_from = trade.from_user
    trade.to_user = old_from
    trade.from_user = request.user
    trade.offered_player = new_offered
    trade.requested_player = original_offered
    trade.save()
    return Response({'message': 'Counter offer sent.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_collection(request, user_id):
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    items = UserCollection.objects.filter(user=target_user).select_related('player')
    players = [
        {
            'sofifa_id': item.player.id,
            'player_name': item.player.player_name,
            'team': item.player.team,
            'position': item.player.position,
            'birth_year': item.player.birth_year,
            'sticker_number': item.player.sticker_number,
        }
        for item in items
    ]
    return Response(players, status=status.HTTP_200_OK)


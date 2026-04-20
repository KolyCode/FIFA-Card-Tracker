from django.http import HttpResponse
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import Player, UserCollection, Group, GroupMembership, GroupInvite


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
    return Response({'email': request.user.email, 'id': request.user.id}, status=status.HTTP_200_OK)


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

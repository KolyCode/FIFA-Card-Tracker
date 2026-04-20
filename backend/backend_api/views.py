from django.http import HttpResponse
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import Player, UserCollection


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

from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("auth/register/", views.auth_register, name="auth-register"),
    path("auth/login/", views.auth_login, name="auth-login"),
    path("auth/logout/", views.auth_logout, name="auth-logout"),
    path("auth/me/", views.auth_me, name="auth-me"),
    path("collection/", views.get_collection, name="collection-list"),
    path("collection/add/", views.add_to_collection, name="collection-add"),
    path("collection/<int:player_id>/", views.remove_from_collection, name="collection-remove"),
]
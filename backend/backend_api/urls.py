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
    path("players/", views.get_all_players, name="players-list"),
    path("groups/", views.get_groups, name="groups-list"),
    path("groups/create/", views.create_group, name="groups-create"),
    path("groups/join/", views.join_group, name="groups-join"),
    path("groups/<int:group_id>/leave/", views.leave_group, name="groups-leave"),
    path("groups/members/invite/", views.invite_member, name="groups-invite-member"),
    path("groups/<int:group_id>/members/<int:user_id>/remove/", views.remove_member, name="groups-remove-member"),
    path("groups/admins/promote/", views.promote_admin, name="groups-promote-admin"),
    path("groups/admins/demote/", views.demote_admin, name="groups-demote-admin"),
    path("groups/invites/", views.get_invites, name="groups-invites"),
    path("groups/invites/<int:invite_id>/respond/", views.respond_to_invite, name="groups-respond-invite"),
    # Moderator endpoints
    path("mod/login/", views.mod_login, name="mod-login"),
    path("mod/me/", views.mod_me, name="mod-me"),
    path("mod/groups/", views.mod_get_all_groups, name="mod-groups-list"),
    path("mod/groups/<int:group_id>/", views.mod_delete_group, name="mod-delete-group"),
    path("mod/groups/members/add/", views.mod_add_member, name="mod-add-member"),
    path("mod/groups/<int:group_id>/members/<int:user_id>/", views.mod_remove_member, name="mod-remove-member"),
    path("mod/players/", views.mod_get_all_players, name="mod-players-list"),
    path("mod/players/add/", views.mod_add_player, name="mod-add-player"),
    path("mod/players/<int:player_id>/", views.mod_delete_player, name="mod-delete-player"),
]
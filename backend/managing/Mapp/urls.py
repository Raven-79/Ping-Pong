from django.urls import path
from . import views, manage_friends
from .manage_users import IsUserLoggedInView, ChangeImage, DeleteImage, ShowCurrentProfile,ShowUser, ShowProfile, ListUsers, ListProfiles, UserDeleteView, CurrentUser, UserSearchView, PlayerRankingView, UpdateCurrentUser,GameHistoryView, WeekStatics, UserStatistics, Health

urlpatterns = [
    #user management
    # path('update_user/<int:id>/', UpdateUser.as_view(), name='update_user'),
    #user must note provide id in the url cuz it will be taken from request.user.id
    path('health/', Health.as_view(), name='health'),
    path('update_user/', UpdateCurrentUser.as_view(), name='update_user'),
    path('week-statics/', WeekStatics.as_view(), name='week-statics'),
    path('week-statics/<int:id>/', WeekStatics.as_view(), name='week-statics'),
    path('game-history/', GameHistoryView.as_view(), name='get-user-game-history'),
    path('game-history/<int:id>/', GameHistoryView.as_view(), name='get-other-user-game-history'),
    path('search-users/', UserSearchView.as_view(), name='user-search'),
    path('dashboard/', PlayerRankingView.as_view(), name='player-ranking'),
    path('current_user/', CurrentUser.as_view(), name='current_user'),
    path('is_logged_in/', IsUserLoggedInView.as_view(), name='is_logged_in'),
    path('user/<int:id>/', ShowUser.as_view(), name='user'),
    #same as update
    path('profile/', ShowCurrentProfile.as_view(), name='profile'),
    path('profile/<int:id>/', ShowProfile.as_view(), name='profile'),
    path('userStatistics/', UserStatistics.as_view(), name='Statistics'),
    path('userStatistics/<int:id>/', UserStatistics.as_view(), name='Statistics'),
    
    path('users/', ListUsers.as_view(), name='users'),
    path('profiles/', ListProfiles.as_view(), name='profiles'),
    path('delete_user/<int:id>/', UserDeleteView.as_view(), name='delete_user'),
    path('change_avatar/', ChangeImage.as_view(), name='change_avatar'),
    path('delete_avatar/', DeleteImage.as_view(), name='delete_avatar'),

    #friends
    path('friends/', manage_friends.get_friends, name='get_friends'),
    path('friends/<int:user_id>/', manage_friends.get_friends, name='get_other_user_friends'),      
    path('friends/send/', manage_friends.send_friend_request, name='send_friend_request'),
    path('friends/cancel/', manage_friends.cancel_friend_request, name='cancel_friend_request'),
    path('friends/accept/', manage_friends.accept_friend_request, name='accept_friend_request'),
    path('friends/reject/', manage_friends.reject_friend_request, name='reject_friend_request'),
    path('friends/unfriend/', manage_friends.delete_friend, name='delete_friend'),
    path('friends/pending/', manage_friends.get_pending_friends, name='get_pending_friends'),
    path('friends/blocked/', manage_friends.get_blocked_friends, name='get_blocked_friends'),
    path('friends/block/', manage_friends.block_friend, name='block_friend'),
    path('friends/unblock/', manage_friends.unblock_friend, name='unblock_friend'),
]



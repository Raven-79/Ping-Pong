from django.contrib.auth.backends import BaseBackend
from django.db import IntegrityError
from my_shared_models.models import Profile, User
from my_shared_models.tools import download_image

class FortyTwoBackend(BaseBackend):
    def authenticate(self, request, **kwargs):
        try:
            user = User.objects.get(username=kwargs.get('login'))
        except User.DoesNotExist:
            # Create a new user
            try:
                user = User.objects.create_user(
                    username=kwargs.get('login'),
                    email=kwargs.get('email'),
                )
                profile, created = Profile.objects.get_or_create(user=user)
                profile.first_name=kwargs.get('first_name')
                profile.last_name=kwargs.get('last_name')
                profile.language = kwargs.get('language')
                profile.display_name = kwargs.get('display_name')
                # saving image
                image_file = download_image(kwargs.get('avatar'))
                if image_file:
                    profile.avatar.save(f"{user.id}.png", image_file, save=True)
                #
                profile.save()
            except IntegrityError:
                # Handle any potential race condition
                return None
        return user


    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None


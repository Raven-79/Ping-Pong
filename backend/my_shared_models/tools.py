import requests
from django.core.files.base import ContentFile
from io import BytesIO
from django.core.files import File
from my_shared_models.models import Profile

def download_image(url):
    response = requests.get(url)
    if response.status_code == 200:
        return ContentFile(response.content, name="avatar.png")
    return None

def path_to_image(image_path, user):
    profile = Profile.objects.get(user=user)
    try:
        with open(image_path, 'rb') as f:
            profile.avatar.save(f"{user.id}.jpg", File(f), save=True)
    except FileNotFoundError:
        print(f"Image file not found: {image_path}")
    except Exception as e:
        print(f"An error occurred while saving avatar: {e}")

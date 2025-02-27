from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path(
        "auth/",
        include(
            [
                path("admin/", admin.site.urls),
                path("", include("Oapp.urls")),
                path("test/", include("Oapp.test_view")),
            ]
        ),
    )
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

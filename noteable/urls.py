"""
URL configuration for noteable project.
"""

from django.contrib import admin
from django.urls import path, include
from session import views as session_views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path(
        "", session_views.dashboard, name="dashboard"
    ),  # Root URL serves the dashboard
    path("api/", include("session.urls")),  # API routes under /api/
    path("accounts/", include("django.contrib.auth.urls")),
    path("admin/", admin.site.urls),
]

# Serve static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

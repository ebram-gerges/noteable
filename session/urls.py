from django.urls import path
from .views import *

urlpatterns = [
    path("sessions/", session_list_api),
    path("sessions/<int:id>/", sessions_api),
    path("categories/", categories_list_api),
    path("categories/<int:id>/", category_details_api),
    path("sessions/add/", session_add_api),
    path("sessions/delete/<int:id>/", session_delete_api),
    path("sessions/update/<int:id>/", session_update_api),
    path("sessions/patch/<int:id>/", session_update_partial_api),
]

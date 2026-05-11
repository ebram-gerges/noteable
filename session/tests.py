from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Session, Category

User = get_user_model()


class SessionAPITests(TestCase):
    def setUp(self):
        """Runs before every test method. Creates reusable data."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )
        self.category = Category.objects.create(
            name="Coding", description="Programming work"
        )

    def test_create_session_authenticated(self):
        """Logged-in user can create a session."""
        self.client.force_login(self.user)

        payload = {
            "title": "Deep Work",
            "description": "Focused coding",
            "duration": 3600,
            "category_id": self.category.id,
        }

        response = self.client.post("/api/sessions/add/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Deep Work")
        self.assertEqual(response.data["user"], self.user.id)
        self.assertEqual(Session.objects.count(), 1)

    def test_create_session_unauthenticated(self):
        """Anonymous user cannot create a session."""
        payload = {
            "title": "Deep Work",
            "duration": 3600,
        }

        response = self.client.post("/api/sessions/add/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_own_session(self):
        """User can delete their own session."""
        self.client.force_login(self.user)
        session = Session.objects.create(
            user=self.user,
            title="To Delete",
            duration=1800,
        )

        response = self.client.delete(f"/api/sessions/delete/{session.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Session.objects.count(), 0)

    def test_delete_other_users_session(self):
        """User cannot delete someone else's session."""
        other_user = User.objects.create_user(username="other", password="otherpass123")
        session = Session.objects.create(
            user=other_user,
            title="Not Yours",
            duration=1800,
        )

        self.client.force_login(self.user)
        response = self.client.delete(f"/api/sessions/delete/{session.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Session.objects.count(), 1)  # Still exists

    def test_update_session_partial(self):
        """PATCH updates only provided fields."""
        self.client.force_login(self.user)
        session = Session.objects.create(
            user=self.user,
            title="Old Title",
            duration=1800,
        )

        response = self.client.patch(
            f"/api/sessions/patch/{session.id}/",
            {"title": "New Title"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "New Title")
        self.assertEqual(response.data["duration"], 1800)  # Unchanged

    def test_list_only_own_sessions(self):
        """User only sees their own sessions in list."""
        other_user = User.objects.create_user(
            username="other2", password="otherpass123"
        )
        Session.objects.create(user=self.user, title="Mine", duration=100)
        Session.objects.create(user=other_user, title="Theirs", duration=200)

        self.client.force_login(self.user)
        response = self.client.get("/api/sessions/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Mine")

    def test_list_only_own_sessions(self):
        """User only sees their own sessions in list."""
        other_user = User.objects.create_user(
            username="other2", password="otherpass123"
        )
        Session.objects.create(user=self.user, title="Mine", duration=100)
        Session.objects.create(user=other_user, title="Theirs", duration=200)

        self.client.force_login(self.user)
        response = self.client.get("/api/sessions/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)  # Fixed
        self.assertEqual(response.data["results"][0]["title"], "Mine")

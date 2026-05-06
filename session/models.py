from django.db import models
from django.conf import settings


# catogery class
class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.name:
            # to convert from"  sTuDy  " to "Study"
            self.name = self.name.strip().title()
        super().save(*args, **kwargs)


# session class
class Session(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    title = models.CharField(max_length=50)
    description = models.TextField(blank=True)

    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True
    )

    duration = models.IntegerField()  # seconds

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

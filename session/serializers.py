from rest_framework import serializers

from .models import Category, Session


class CategorySerializers(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "description"]
        read_only_fields = ["id", "name", "description"]


class CategoriesListSerializers(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]
        read_only_fields = ["id", "name"]


class SessionSerializers(serializers.ModelSerializer):
    category = CategorySerializers(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Session
        fields = [
            "id",
            "category",
            "category_id",
            "user",
            "title",
            "description",
            "duration",
            "created_at",
        ]

        read_only_fields = ["id", "user", "created_at"]


class SessionListSerializers(serializers.ModelSerializer):
    category = CategoriesListSerializers(read_only=True)

    class Meta:
        model = Session
        fields = ["id", "title", "duration", "category", "created_at"]
        read_only_fields = ["id", "title", "duration", "category", "created_at"]

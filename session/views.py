from django.shortcuts import render
from .models import Session, Category
from django.contrib.auth.decorators import login_required
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from .serializers import (
    SessionSerializers,
    CategorySerializers,
    SessionListSerializers,
    CategoriesListSerializers,
)


@permission_classes([IsAuthenticated])
def dashboard(request):
    """Render the session tracking dashboard."""
    sessions = Session.objects.filter(user=request.user)
    categories = Category.objects.all()

    context = {"sessions": sessions, "categories": categories}

    return render(request, "session/dashboard.html", context)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def sessions_api(request, id):
    print(f"the user in this api is {request.user}")

    try:
        sessions = Session.objects.get(user=request.user, pk=id)
        session = SessionSerializers(sessions)
        return Response(session.data, status=200)
    except Session.DoesNotExist:
        return Response({"error": "does not exist"}, status=404)


@api_view(["GET"])
def category_details_api(request, id):

    print(f"the user in this api is {request.user}")
    try:
        categories = Category.objects.get(pk=id)
        cat = CategorySerializers(categories)
        return Response(cat.data, status=200)
    except Category.DoesNotExist:
        return Response({"error": "did not found"}, status=404)


@api_view(["GET"])
def categories_list_api(request):
    """get's all categories"""
    categories = Category.objects.all()
    cats = CategoriesListSerializers(categories, many=True)
    return Response(cats.data, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def session_add_api(request):
    print(f"the user in this api is {request.user}")
    session = SessionSerializers(data=request.data)
    if session.is_valid():
        session.save(user=request.user)
        return Response(session.data, status=201)
    else:
        return Response(session.errors, status=400)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def session_list_api(request):
    """sends neccessary data for all sessions"""
    sessions = Session.objects.filter(user=request.user)
    res = SessionListSerializers(sessions, many=True)
    return Response(res.data, status=200)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def session_delete_api(request, id):
    """deletes specific session from db"""
    try:
        session = Session.objects.get(user=request.user, pk=id)
        session.delete()
        return Response({"success": "session deleted"}, status=200)
    except Session.DoesNotExist:
        return Response({"error": "session not found or access denied"}, status=404)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def session_update_api(request, id):
    try:
        session = Session.objects.get(user=request.user, pk=id)
    except Session.DoesNotExist:
        return Response(
            {"error": "this session is not found or access denied"}, status=404
        )
    serializer = SessionSerializers(session, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=200)
    else:
        return Response(
            {"error": "form is not valid", "details": serializer.errors}, status=400
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def session_update_partial_api(request, id):
    try:
        session = Session.objects.get(user=request.user, pk=id)
    except Session.DoesNotExist:
        return Response(
            {"error": "this session is not found or access denied"}, status=404
        )
    serializer = SessionSerializers(session, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=200)
    else:
        return Response(
            {"error": "form is not valid", "details": serializer.errors}, status=400
        )

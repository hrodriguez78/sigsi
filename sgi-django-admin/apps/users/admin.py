from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("email", "username", "first_name", "last_name", "is_active")
    list_filter = ("is_active", "is_staff", "organization")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering = ("email",)

    fieldsets = UserAdmin.fieldsets + (
        ("Información adicional", {"fields": ("phone", "avatar", "organization")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Información adicional", {"fields": ("email", "phone")}),
    )

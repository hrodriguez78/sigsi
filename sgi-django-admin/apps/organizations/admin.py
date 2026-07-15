from django.contrib import admin
from .models import Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "nit", "email", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "nit", "email")
    ordering = ("name",)

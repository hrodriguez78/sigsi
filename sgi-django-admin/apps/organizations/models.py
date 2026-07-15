from django.db import models
from apps.core.models import TimeStampedModel


class Organization(TimeStampedModel):
    name = models.CharField(max_length=200, verbose_name="Nombre")
    nit = models.CharField(max_length=20, unique=True, verbose_name="NIT")
    description = models.TextField(blank=True, verbose_name="Descripción")
    address = models.CharField(max_length=300, blank=True, verbose_name="Dirección")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Teléfono")
    email = models.EmailField(blank=True, verbose_name="Email")
    website = models.URLField(blank=True, verbose_name="Sitio web")
    logo = models.ImageField(upload_to="organizations/logos/", blank=True, null=True)

    class Meta:
        verbose_name = "Organización"
        verbose_name_plural = "Organizaciones"
        ordering = ["name"]

    def __str__(self):
        return self.name

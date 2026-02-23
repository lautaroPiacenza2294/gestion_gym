from django.db import models
from clientes.models import Cliente
from membresias.models import Membresia


class RegistroAcceso(models.Model):
    RESULTADO_CHOICES = [
        ('permitido', 'Permitido'),
        ('denegado', 'Denegado'),
    ]

    MOTIVO_CHOICES = [
        ('no_encontrado', 'DNI no encontrado'),
        ('cliente_inactivo', 'Cliente inactivo'),
        ('sin_membresia', 'Sin membresía activa'),
        ('membresia_vencida', 'Membresía vencida'),
    ]

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='accesos'
    )
    dni_ingresado = models.CharField(max_length=20)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    resultado = models.CharField(max_length=20, choices=RESULTADO_CHOICES)
    motivo_denegacion = models.CharField(
        max_length=30,
        choices=MOTIVO_CHOICES,
        null=True, blank=True
    )
    membresia = models.ForeignKey(
        Membresia,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='accesos'
    )
    dias_restantes = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['-fecha_hora']
        verbose_name = 'Registro de Acceso'
        verbose_name_plural = 'Registros de Acceso'

    def __str__(self):
        return f"DNI {self.dni_ingresado} - {self.resultado} - {self.fecha_hora}"

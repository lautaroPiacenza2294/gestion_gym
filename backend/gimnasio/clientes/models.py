from django.db import models
from datetime import timedelta

# Create your models here.
# clientes/models.py

class Cliente(models.Model):
    nombre = models.CharField(max_length=100)  #lautaro
    apellido = models.CharField(max_length=100) #piacenza
    dni = models.CharField(max_length=20, unique=True) #38280942
    email = models.EmailField(unique=True) #lautaro.piacenza@gmail.com
    telefono = models.CharField(max_length=20) #3584864392
    contacto_emergencia = models.CharField(max_length=20) #3584864392
    fecha_nacimiento = models.DateField() #22/12/94
    direccion = models.CharField(max_length=200, blank=True) #peru394
    activo = models.BooleanField(default=True) 
    fecha_registro = models.DateTimeField(auto_now_add=True) 
    observaciones = models.TextField(blank=True) #muy fachero
    
    def __str__(self):
        return f"{self.nombre} {self.apellido}"


class Huella(models.Model):
    cliente = models.OneToOneField(Cliente, on_delete=models.CASCADE, related_name='huella') #lautaro
    huella_data = models.BinaryField()  # O TextField si usás base64 
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activa = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Huella de {self.cliente}"


class Recordatorio(models.Model):
    TIPO_CHOICES = [
        ('vencimiento', 'Vencimiento'),
        ('deuda', 'Deuda'),
        ('renovacion', 'Renovación'),
    ]
    CANAL_CHOICES = [
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email'),
    ]
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('enviado', 'Enviado'),
        ('cancelado', 'Cancelado'),
    ]
    
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='recordatorios') #lautaro
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES) #deuda
    canal = models.CharField(max_length=20, choices=CANAL_CHOICES) #wsp
    mensaje = models.TextField() #paga gato
    fecha_programada = models.DateTimeField() #####
    fecha_envio = models.DateTimeField(null=True, blank=True) #####
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    
    def __str__(self):
        return f"Recordatorio {self.tipo} - {self.cliente}"


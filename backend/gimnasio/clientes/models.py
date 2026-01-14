from django.db import models

# Create your models here.
# clientes/models.py

class Cliente(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    dni = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20)
    contacto_emergencia = models.CharField(max_length=20)
    fecha_nacimiento = models.DateField()
    direccion = models.CharField(max_length=200, blank=True)
    activo = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    observaciones = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.nombre} {self.apellido}"

class Huella(models.Model):
    cliente = models.OneToOneField(Cliente, on_delete=models.CASCADE, related_name='huella')
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
    
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='recordatorios')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    canal = models.CharField(max_length=20, choices=CANAL_CHOICES)
    mensaje = models.TextField()
    fecha_programada = models.DateTimeField()
    fecha_envio = models.DateTimeField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    
    def __str__(self):
        return f"Recordatorio {self.tipo} - {self.cliente}"

class Rutina(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='rutinas')
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    archivo = models.FileField(upload_to='rutinas/', blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_envio = models.DateTimeField(null=True, blank=True)
    activa = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.nombre} - {self.cliente}"
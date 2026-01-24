from django.db import models

# Create your models here.
from django.db import models
from clientes.models import Cliente
from membresias.models import Membresia


class Pago(models.Model):
    """Registro de pagos realizados por clientes"""
    METODO_PAGO_CHOICES = [
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia'),
        ('tarjeta_debito', 'Tarjeta de Débito'),
        ('tarjeta_credito', 'Tarjeta de Crédito'),
        ('mercadopago', 'Mercado Pago'),
    ]
    
    CONCEPTO_CHOICES = [
        ('membresia', 'Membresía'),
        ('inscripcion', 'Inscripción'),
        ('clase_particular', 'Clase Particular'),
        ('producto', 'Venta de Producto'),
        ('otro', 'Otro'),
    ]
    
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name='pagos')
    membresia = models.ForeignKey(Membresia, on_delete=models.SET_NULL, null=True, blank=True, related_name='pagos')
    
    fecha_pago = models.DateField()
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    metodo_pago = models.CharField(max_length=20, choices=METODO_PAGO_CHOICES)
    concepto = models.CharField(max_length=20, choices=CONCEPTO_CHOICES, default='membresia')
    
    observaciones = models.TextField(blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-fecha_pago']
        verbose_name = 'Pago'
        verbose_name_plural = 'Pagos'
    
    def __str__(self):
        return f"{self.cliente} - ${self.monto} - {self.fecha_pago}"


class GastoFijo(models.Model):
    """Gastos fijos mensuales del gimnasio"""
    CATEGORIA_CHOICES = [
        ('alquiler', 'Alquiler'),
        ('servicios', 'Servicios (luz, agua, gas)'),
        ('internet', 'Internet/Teléfono'),
        ('salarios', 'Salarios'),
        ('impuestos', 'Impuestos'),
        ('seguro', 'Seguros'),
        ('limpieza', 'Limpieza'),
        ('otro', 'Otro'),
    ]
    
    nombre = models.CharField(max_length=200)
    categoria = models.CharField(max_length=20, choices=CATEGORIA_CHOICES)
    monto_mensual = models.DecimalField(max_digits=10, decimal_places=2)
    dia_vencimiento = models.IntegerField(help_text="Día del mes que vence (1-31)")
    
    activo = models.BooleanField(default=True)
    observaciones = models.TextField(blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['dia_vencimiento']
        verbose_name = 'Gasto Fijo'
        verbose_name_plural = 'Gastos Fijos'
    
    def __str__(self):
        return f"{self.nombre} - ${self.monto_mensual}"


class Egreso(models.Model):
    """Egresos y gastos variables del gimnasio"""
    CATEGORIA_CHOICES = [
        ('equipamiento', 'Equipamiento'),
        ('mantenimiento', 'Mantenimiento'),
        ('reparaciones', 'Reparaciones'),
        ('insumos', 'Insumos de Limpieza'),
        ('marketing', 'Marketing/Publicidad'),
        ('suplementos', 'Suplementos/Productos'),
        ('servicios_profesionales', 'Servicios Profesionales'),
        ('otro', 'Otro'),
    ]
    
    METODO_PAGO_CHOICES = [
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia'),
        ('tarjeta_debito', 'Tarjeta de Débito'),
        ('tarjeta_credito', 'Tarjeta de Crédito'),
    ]
    
    fecha = models.DateField()
    categoria = models.CharField(max_length=30, choices=CATEGORIA_CHOICES)
    descripcion = models.CharField(max_length=300)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    metodo_pago = models.CharField(max_length=20, choices=METODO_PAGO_CHOICES)
    
    proveedor = models.CharField(max_length=200, blank=True)
    comprobante = models.CharField(max_length=100, blank=True, help_text="Nº de factura/recibo")
    
    observaciones = models.TextField(blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-fecha']
        verbose_name = 'Egreso'
        verbose_name_plural = 'Egresos'
    
    def __str__(self):
        return f"{self.descripcion} - ${self.monto} - {self.fecha}"


class EstadoCuenta(models.Model):
    """Estado de cuenta de cada cliente"""
    ESTADO_CHOICES = [
        ('al_dia', 'Al Día'),
        ('debe', 'Debe'),
        ('suspendido', 'Suspendido por Falta de Pago'),
    ]
    
    cliente = models.OneToOneField(Cliente, on_delete=models.CASCADE, related_name='estado_cuenta')
    membresia_activa = models.ForeignKey(
        Membresia, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='estado_cuenta'
    )
    
    saldo_pendiente = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    ultimo_pago = models.DateField(null=True, blank=True)
    proximo_vencimiento = models.DateField(null=True, blank=True)
    
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='al_dia')
    observaciones = models.TextField(blank=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Estado de Cuenta'
        verbose_name_plural = 'Estados de Cuenta'
    
    def __str__(self):
        return f"{self.cliente} - {self.estado} - Saldo: ${self.saldo_pendiente}"
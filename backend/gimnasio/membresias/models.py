from django.db import models


class Ejercicio(models.Model):
    """Catálogo de ejercicios disponibles"""
    CATEGORIA_CHOICES = [
        ('fuerza', 'Fuerza'),
        ('cardio', 'Cardio'),
        ('flexibilidad', 'Flexibilidad'),
        ('funcional', 'Funcional'),
        ('olimpico', 'Olímpico'),
    ]
    
    GRUPO_MUSCULAR_CHOICES = [
        ('pecho', 'Pecho'),
        ('espalda', 'Espalda'),
        ('piernas', 'Piernas'),
        ('hombros', 'Hombros'),
        ('brazos', 'Brazos'),
        ('core', 'Core'),
        ('full_body', 'Cuerpo Completo'),
    ]
    
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    categoria = models.CharField(max_length=20, choices=CATEGORIA_CHOICES)
    grupo_muscular = models.CharField(max_length=20, choices=GRUPO_MUSCULAR_CHOICES)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['nombre']
        verbose_name_plural = 'Ejercicios'
    
    def __str__(self):
        return self.nombre


class Rutina(models.Model):
    """Rutina de entrenamiento de 4 semanas para un cliente"""
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='rutinas')
    nombre = models.CharField(max_length=200)
    objetivo = models.TextField(help_text="Objetivo del plan (ej: pérdida de peso, ganancia muscular, etc.)")
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(help_text="Automáticamente 4 semanas después del inicio")
    observaciones = models.TextField(blank=True)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-fecha_inicio']
        verbose_name = 'Rutina'
        verbose_name_plural = 'Rutinas'
    
    def __str__(self):
        return f"{self.nombre} - {self.cliente}"
    
    def save(self, *args, **kwargs):
        # Si no tiene fecha_fin, calcular 4 semanas (28 días) desde fecha_inicio
        if not self.fecha_fin and self.fecha_inicio:
            self.fecha_fin = self.fecha_inicio + timedelta(days=28)
        super().save(*args, **kwargs)


class Semana(models.Model):
    """Cada rutina tiene 4 semanas"""
    rutina = models.ForeignKey(Rutina, on_delete=models.CASCADE, related_name='semanas')
    numero = models.IntegerField(help_text="Número de semana (1-4)")
    notas = models.TextField(blank=True, help_text="Notas específicas para esta semana")
    
    class Meta:
        ordering = ['numero']
        unique_together = ['rutina', 'numero']
    
    def __str__(self):
        return f"Semana {self.numero} - {self.rutina.nombre}"


class DiaEntrenamiento(models.Model):
    """Cada semana puede tener varios días de entrenamiento"""
    DIA_SEMANA_CHOICES = [
        (1, 'Lunes'),
        (2, 'Martes'),
        (3, 'Miércoles'),
        (4, 'Jueves'),
        (5, 'Viernes'),
        (6, 'Sábado'),
        (7, 'Domingo'),
    ]
    
    semana = models.ForeignKey(Semana, on_delete=models.CASCADE, related_name='dias')
    dia_semana = models.IntegerField(choices=DIA_SEMANA_CHOICES)
    nombre = models.CharField(max_length=100, help_text="Ej: Día de Piernas, Upper Body, etc.")
    notas = models.TextField(blank=True)
    
    class Meta:
        ordering = ['dia_semana']
        unique_together = ['semana', 'dia_semana']
        verbose_name = 'Día de Entrenamiento'
        verbose_name_plural = 'Días de Entrenamiento'
    
    def __str__(self):
        return f"{self.get_dia_semana_display()} - {self.nombre}"


class EjercicioDia(models.Model):
    """Ejercicios asignados a un día específico"""
    TIPO_SERIE_CHOICES = [
        ('normal', 'Normal'),
        ('superset', 'Superset'),
        ('dropset', 'Dropset'),
        ('amrap', 'AMRAP'),
        ('emom', 'EMOM'),
        ('for_time', 'For Time'),
    ]
    
    dia = models.ForeignKey(DiaEntrenamiento, on_delete=models.CASCADE, related_name='ejercicios')
    ejercicio = models.ForeignKey(Ejercicio, on_delete=models.PROTECT, related_name='asignaciones')
    orden = models.IntegerField(help_text="Orden de ejecución en el día")
    
    # Configuración del ejercicio
    series = models.IntegerField(default=3)
    repeticiones = models.CharField(max_length=50, help_text="Ej: 10, 8-12, MAX, etc.")
    descanso = models.CharField(max_length=50, blank=True, help_text="Ej: 60s, 1-2min, etc.")
    
    tipo_serie = models.CharField(max_length=20, choices=TIPO_SERIE_CHOICES, default='normal')
    notas = models.TextField(blank=True, help_text="Instrucciones específicas para este ejercicio")
    
    class Meta:
        ordering = ['orden']
        verbose_name = 'Ejercicio del Día'
        verbose_name_plural = 'Ejercicios del Día'
    
    def __str__(self):
        return f"{self.ejercicio.nombre} - {self.series}x{self.repeticiones}"
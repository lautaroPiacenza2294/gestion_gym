from rest_framework import serializers
from .models import (
    Ejercicio, 
    Rutina, 
    Semana, 
    DiaEntrenamiento, 
    EjercicioDia, 
    Plan, 
    Membresia
)

# ============================================
# SERIALIZERS PARA EJERCICIO
# ============================================

class EjercicioSerializer(serializers.ModelSerializer):
    """Serializer completo de Ejercicio"""
    class Meta:
        model = Ejercicio
        fields = '__all__'

# ============================================
# SERIALIZERS PARA PLAN
# ============================================

class PlanSerializer(serializers.ModelSerializer):
    """Serializer completo con todos los campos"""
    class Meta:
        model = Plan
        fields = '__all__'


class PlanListSerializer(serializers.ModelSerializer):
    """Serializer para listar planes"""
    class Meta:
        model = Plan
        fields = ['id', 'nombre', 'precio', 'activo']


class PlanCreateSerializer(serializers.ModelSerializer):
    """Para crear o editar planes"""
    class Meta:
        model = Plan
        fields = ['nombre', 'frecuencia_semanal', 'precio', 'descripcion', 'activo']
    
    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a 0")
        return value
    
    def validate_frecuencia_semanal(self, value):
        if value not in [2, 3, 5]:
            raise serializers.ValidationError("La frecuencia debe ser 2, 3 o 5 veces por semana")
        return value

class PlanDetalleSerializer(serializers.ModelSerializer):
    """Con información adicional y campos calculados"""
    precio_formateado = serializers.SerializerMethodField()
    cantidad_membresias = serializers.SerializerMethodField()
    
    class Meta:
        model = Plan
        fields = '__all__'
    
    def get_precio_formateado(self, obj):
        return f"${obj.precio:,.2f}"
    
    def get_cantidad_membresias(self, obj):
        return obj.membresias.filter(estado='activa').count()

# ============================================
# SERIALIZERS PARA MEMBRESÍA
# ============================================

class MembresiaSerializer(serializers.ModelSerializer):
    """Serializer completo de membresía"""
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    cliente_apellido = serializers.CharField(source='cliente.apellido', read_only=True)
    cliente_dni = serializers.CharField(source='cliente.dni', read_only=True)
    plan_nombre = serializers.CharField(source='plan.nombre', read_only=True)
    plan_frecuencia = serializers.IntegerField(source='plan.frecuencia_semanal', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = Membresia
        fields = '__all__'


class MembresiaListSerializer(serializers.ModelSerializer):
    """Serializer para listar membresías"""
    nombre = serializers.SerializerMethodField()
    plan = serializers.CharField(source='plan.nombre', read_only=True)
    estado = serializers.CharField(source='get_estado_display', read_only=True)
    dias_restantes = serializers.SerializerMethodField()
    
    class Meta:
        model = Membresia
        fields = ['id', 'nombre', 'plan', 'estado', 'dias_restantes']
    
    def get_nombre(self, obj):
        return f"{obj.cliente.nombre} {obj.cliente.apellido}"
    
    def get_dias_restantes(self, obj):
        from datetime import date
        hoy = date.today()
        if obj.fecha_fin < hoy:
            return 0
        return (obj.fecha_fin - hoy).days

# ============================================
# SERIALIZERS PARA EJERCICIODÍA
# ============================================

class EjercicioDiaSerializer(serializers.ModelSerializer):
    """Serializer para ejercicios asignados a un día"""
    ejercicio_nombre = serializers.CharField(source='ejercicio.nombre', read_only=True)
    ejercicio_categoria = serializers.CharField(source='ejercicio.categoria', read_only=True)
    
    class Meta:
        model = EjercicioDia
        fields = '__all__'

# ============================================
# SERIALIZERS PARA DÍA DE ENTRENAMIENTO
# ============================================

class DiaEntrenamientoSerializer(serializers.ModelSerializer):
    """Serializer para días de entrenamiento con ejercicios"""
    ejercicios = EjercicioDiaSerializer(many=True, read_only=True)
    dia_semana_display = serializers.CharField(source='get_dia_semana_display', read_only=True)
    
    class Meta:
        model = DiaEntrenamiento
        fields = '__all__'

# ============================================
# SERIALIZERS PARA SEMANA
# ============================================
class SemanaSerializer(serializers.ModelSerializer):
    """Serializer completo de Semana"""
    class Meta:
        model = Semana
        fields = '__all__'

class SemanaListSerializer(serializers.ModelSerializer):
    """Serializer ligero para listar semanas"""
    rutina_nombre = serializers.CharField(source='rutina.nombre', read_only=True)
    cliente_nombre = serializers.SerializerMethodField()
    cantidad_dias = serializers.SerializerMethodField()
    
    class Meta:
        model = Semana
        fields = ['id', 'numero', 'rutina', 'rutina_nombre', 'cliente_nombre', 'cantidad_dias']
    
    def get_cliente_nombre(self, obj):
        """Nombre del cliente de la rutina"""
        return f"{obj.rutina.cliente.nombre} {obj.rutina.cliente.apellido}"
    
    def get_cantidad_dias(self, obj):
        """Contar cuántos días tiene programados"""
        return obj.dias.count()


class SemanaDetalleSerializer(serializers.ModelSerializer):
    """Serializer completo con días de entrenamiento incluidos"""
    # Incluir todos los días de la semana (anidado)
    dias = DiaEntrenamientoSerializer(many=True, read_only=True)
    
    # Info de la rutina
    rutina_nombre = serializers.CharField(source='rutina.nombre', read_only=True)
    rutina_objetivo = serializers.CharField(source='rutina.objetivo', read_only=True)
    
    # Info del cliente
    cliente_nombre = serializers.SerializerMethodField()
    
    # Estadísticas
    cantidad_dias = serializers.SerializerMethodField()
    total_ejercicios = serializers.SerializerMethodField()
    
    class Meta:
        model = Semana
        fields = '__all__'
    
    def get_cliente_nombre(self, obj):
        return f"{obj.rutina.cliente.nombre} {obj.rutina.cliente.apellido}"
    
    def get_cantidad_dias(self, obj):
        """Cantidad de días programados"""
        return obj.dias.count()
    
    def get_total_ejercicios(self, obj):
        """Total de ejercicios en toda la semana"""
        total = 0
        for dia in obj.dias.all():
            total += dia.ejercicios.count()
        return total


class SemanaCreateSerializer(serializers.ModelSerializer):
    """Para crear o editar semanas"""
    class Meta:
        model = Semana
        fields = ['rutina', 'numero', 'notas']
    
    def validate_numero(self, value):
        """Validar que el número de semana sea 1-4"""
        if value < 1 or value > 4:
            raise serializers.ValidationError("El número de semana debe estar entre 1 y 4")
        return value
    
    def validate(self, data):
        """Validar que no exista otra semana con el mismo número en la misma rutina"""
        rutina = data.get('rutina')
        numero = data.get('numero')
        
        # Si estamos actualizando (self.instance existe), excluir la semana actual
        if self.instance:
            existe = Semana.objects.filter(
                rutina=rutina, 
                numero=numero
            ).exclude(id=self.instance.id).exists()
        else:
            existe = Semana.objects.filter(rutina=rutina, numero=numero).exists()
        
        if existe:
            raise serializers.ValidationError(
                f"Ya existe una Semana {numero} en esta rutina"
            )
        
        return data

# ============================================
# SERIALIZERS PARA RUTINA
# ============================================

class RutinaSerializer(serializers.ModelSerializer):
    """Serializer completo de Rutina"""
    class Meta:
        model = Rutina
        fields = '__all__'


class RutinaListSerializer(serializers.ModelSerializer):
    """Serializer ligero para listar rutinas"""
    cliente_nombre_completo = serializers.SerializerMethodField()
    cliente_dni = serializers.CharField(source='cliente.dni', read_only=True)
    dias_restantes = serializers.SerializerMethodField()
    cantidad_semanas = serializers.SerializerMethodField()
    
    class Meta:
        model = Rutina
        fields = [
            'id',
            'nombre',
            'cliente',
            'cliente_nombre_completo',
            'cliente_dni',
            'fecha_inicio',
            'fecha_fin',
            'dias_restantes',
            'cantidad_semanas',
            'activo'
        ]
    
    def get_cliente_nombre_completo(self, obj):
        """Nombre completo del cliente"""
        return f"{obj.cliente.nombre} {obj.cliente.apellido}"
    
    def get_dias_restantes(self, obj):
        """Calcular días restantes de la rutina"""
        from datetime import date
        hoy = date.today()
        
        if obj.fecha_fin < hoy:
            return 0
        
        return (obj.fecha_fin - hoy).days
    
    def get_cantidad_semanas(self, obj):
        """Cantidad de semanas programadas"""
        return obj.semanas.count()


class RutinaDetalleSerializer(serializers.ModelSerializer):
    """Serializer completo con todas las semanas y días incluidos"""
    # Incluir semanas completas (anidadas)
    semanas = SemanaDetalleSerializer(many=True, read_only=True)
    
    # Info del cliente
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    cliente_apellido = serializers.CharField(source='cliente.apellido', read_only=True)
    cliente_dni = serializers.CharField(source='cliente.dni', read_only=True)
    cliente_email = serializers.EmailField(source='cliente.email', read_only=True)
    
    # Estadísticas
    dias_restantes = serializers.SerializerMethodField()
    total_semanas = serializers.SerializerMethodField()
    total_dias_entrenamiento = serializers.SerializerMethodField()
    total_ejercicios = serializers.SerializerMethodField()
    progreso = serializers.SerializerMethodField()
    
    class Meta:
        model = Rutina
        fields = '__all__'
    
    def get_dias_restantes(self, obj):
        """Días restantes de la rutina"""
        from datetime import date
        hoy = date.today()
        if obj.fecha_fin < hoy:
            return 0
        return (obj.fecha_fin - hoy).days
    
    def get_total_semanas(self, obj):
        """Total de semanas programadas"""
        return obj.semanas.count()
    
    def get_total_dias_entrenamiento(self, obj):
        """Total de días de entrenamiento en todas las semanas"""
        total = 0
        for semana in obj.semanas.all():
            total += semana.dias.count()
        return total
    
    def get_total_ejercicios(self, obj):
        """Total de ejercicios en toda la rutina"""
        total = 0
        for semana in obj.semanas.all():
            for dia in semana.dias.all():
                total += dia.ejercicios.count()
        return total
    
    def get_progreso(self, obj):
        """Calcular porcentaje de progreso (días transcurridos)"""
        from datetime import date
        hoy = date.today()
        
        # Si no ha empezado
        if hoy < obj.fecha_inicio:
            return 0
        
        # Si ya terminó
        if hoy > obj.fecha_fin:
            return 100
        
        # Calcular progreso
        total_dias = (obj.fecha_fin - obj.fecha_inicio).days
        dias_transcurridos = (hoy - obj.fecha_inicio).days
        
        if total_dias == 0:
            return 0
        
        progreso = (dias_transcurridos / total_dias) * 100
        return round(progreso, 2)


class RutinaCreateSerializer(serializers.ModelSerializer):
    """Para crear o editar rutinas"""
    class Meta:
        model = Rutina
        fields = [
            'cliente',
            'nombre',
            'objetivo',
            'fecha_inicio',
            'observaciones',
            'activo'
        ]
        # fecha_fin se calcula automáticamente en el modelo
        # fecha_creacion también es automática
    
    def validate_nombre(self, value):
        """Validar que el nombre no esté vacío"""
        if not value.strip():
            raise serializers.ValidationError("El nombre no puede estar vacío")
        return value
    
    def validate_objetivo(self, value):
        """Validar que el objetivo tenga contenido"""
        if not value.strip():
            raise serializers.ValidationError("El objetivo no puede estar vacío")
        return value
    
    def validate(self, data):
        """Validaciones generales"""
        from datetime import date
        
        fecha_inicio = data.get('fecha_inicio')
        
        # Validar que la fecha de inicio no sea muy antigua
        if fecha_inicio:
            if fecha_inicio < date.today():
                # Permitir hasta 7 días atrás
                dias_atras = (date.today() - fecha_inicio).days
                if dias_atras > 7:
                    raise serializers.ValidationError(
                        "La fecha de inicio no puede ser más de 7 días en el pasado"
                    )
        
        return data


class RutinaResumenSerializer(serializers.ModelSerializer):
    """Serializer para resumen rápido de rutina (sin anidados pesados)"""
    cliente_nombre_completo = serializers.SerializerMethodField()
    total_semanas = serializers.SerializerMethodField()
    total_ejercicios = serializers.SerializerMethodField()
    progreso = serializers.SerializerMethodField()
    estado = serializers.SerializerMethodField()
    
    class Meta:
        model = Rutina
        fields = [
            'id',
            'nombre',
            'cliente_nombre_completo',
            'objetivo',
            'fecha_inicio',
            'fecha_fin',
            'total_semanas',
            'total_ejercicios',
            'progreso',
            'estado',
            'activo'
        ]
    
    def get_cliente_nombre_completo(self, obj):
        return f"{obj.cliente.nombre} {obj.cliente.apellido}"
    
    def get_total_semanas(self, obj):
        return obj.semanas.count()
    
    def get_total_ejercicios(self, obj):
        total = 0
        for semana in obj.semanas.all():
            for dia in semana.dias.all():
                total += dia.ejercicios.count()
        return total
    
    def get_progreso(self, obj):
        from datetime import date
        hoy = date.today()
        
        if hoy < obj.fecha_inicio:
            return 0
        if hoy > obj.fecha_fin:
            return 100
        
        total_dias = (obj.fecha_fin - obj.fecha_inicio).days
        dias_transcurridos = (hoy - obj.fecha_inicio).days
        
        if total_dias == 0:
            return 0
        
        return round((dias_transcurridos / total_dias) * 100, 2)
    
    def get_estado(self, obj):
        """Estado de la rutina (por empezar, en curso, finalizada)"""
        from datetime import date
        hoy = date.today()
        
        if not obj.activo:
            return "Inactiva"
        
        if hoy < obj.fecha_inicio:
            return "Por empezar"
        elif hoy > obj.fecha_fin:
            return "Finalizada"
        else:
            return "En curso"
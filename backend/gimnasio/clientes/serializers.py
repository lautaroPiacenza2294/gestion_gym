from rest_framework import serializers
from .models import Cliente, Recordatorio


# ============================================
# SERIALIZERS PARA CLIENTE
# ============================================

class ClienteSerializer(serializers.ModelSerializer):
    """Serializer completo de Cliente"""
    class Meta:
        model = Cliente
        fields = '__all__'


class ClienteListSerializer(serializers.ModelSerializer):
    """Serializer para listar clientes"""
    nombre_completo = serializers.SerializerMethodField()
    edad = serializers.SerializerMethodField()
    
    class Meta:
        model = Cliente
        fields = [
            'id',
            'nombre',
            'apellido',
            'nombre_completo',
            'dni',
            'telefono',
            'email',
            'edad',
            'activo'
        ]
    
    def get_nombre_completo(self, obj):
        """Nombre completo del cliente"""
        return f"{obj.nombre} {obj.apellido}"
    
    def get_edad(self, obj):
        """Calcular edad del cliente"""
        from datetime import date
        hoy = date.today()
        edad = hoy.year - obj.fecha_nacimiento.year
        
        # Ajustar si no cumplió años todavía este año
        if (hoy.month, hoy.day) < (obj.fecha_nacimiento.month, obj.fecha_nacimiento.day):
            edad -= 1
        
        return edad


class ClienteCreateSerializer(serializers.ModelSerializer):
    """Para crear o editar clientes"""
    class Meta:
        model = Cliente
        fields = [
            'nombre',
            'apellido',
            'dni',
            'email',
            'telefono',
            'contacto_emergencia',
            'fecha_nacimiento',
            'direccion',
            'activo',
            'observaciones'
        ]
    
    def validate_dni(self, value):
        """Validar que el DNI tenga 8 dígitos"""
        if len(value) != 8:
            raise serializers.ValidationError("El DNI debe tener 8 dígitos")
        
        if not value.isdigit():
            raise serializers.ValidationError("El DNI solo puede contener números")
        
        return value


class ClienteDetalleSerializer(serializers.ModelSerializer):
    """Serializer completo con información adicional"""
    nombre_completo = serializers.SerializerMethodField()
    edad = serializers.SerializerMethodField()
    cantidad_recordatorios_pendientes = serializers.SerializerMethodField()
    
    class Meta:
        model = Cliente
        fields = '__all__'
    
    def get_nombre_completo(self, obj):
        return f"{obj.nombre} {obj.apellido}"
    
    def get_edad(self, obj):
        from datetime import date
        hoy = date.today()
        edad = hoy.year - obj.fecha_nacimiento.year
        if (hoy.month, hoy.day) < (obj.fecha_nacimiento.month, obj.fecha_nacimiento.day):
            edad -= 1
        return edad
    
    def get_cantidad_recordatorios_pendientes(self, obj):
        """Contar recordatorios pendientes"""
        return obj.recordatorios.filter(estado='pendiente').count()


# ============================================
# SERIALIZERS PARA RECORDATORIO
# ============================================

class RecordatorioSerializer(serializers.ModelSerializer):
    """Serializer completo de Recordatorio"""
    class Meta:
        model = Recordatorio
        fields = '__all__'


class RecordatorioListSerializer(serializers.ModelSerializer):
    """Serializer para listar recordatorios"""
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    cliente_apellido = serializers.CharField(source='cliente.apellido', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    canal_display = serializers.CharField(source='get_canal_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = Recordatorio
        fields = [
            'id',
            'cliente',
            'cliente_nombre',
            'cliente_apellido',
            'tipo',
            'tipo_display',
            'canal',
            'canal_display',
            'estado',
            'estado_display',
            'fecha_programada',
            'fecha_envio'
        ]


class RecordatorioCreateSerializer(serializers.ModelSerializer):
    """Para crear o editar recordatorios"""
    class Meta:
        model = Recordatorio
        fields = [
            'cliente',
            'tipo',
            'canal',
            'mensaje',
            'fecha_programada',
            'estado'
        ]
    
    def validate_mensaje(self, value):
        """Validar que el mensaje no esté vacío"""
        if not value.strip():
            raise serializers.ValidationError("El mensaje no puede estar vacío")
        return value
    
    def validate(self, data):
        """Validaciones generales"""
        from datetime import datetime
        
        fecha_programada = data.get('fecha_programada')
        
        # Validar que la fecha programada no sea en el pasado
        if fecha_programada:
            if fecha_programada < datetime.now():
                raise serializers.ValidationError(
                    "La fecha programada no puede ser en el pasado"
                )
        
        return data
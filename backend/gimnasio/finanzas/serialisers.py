from rest_framework import serializers
from .models import Pago, GastoFijo, Egreso, EstadoCuenta


# ============================================
# SERIALIZERS PARA PAGO
# ============================================

class PagoSerializer(serializers.ModelSerializer):
    """Serializer completo de Pago"""
    class Meta:
        model = Pago
        fields = '__all__'


class PagoListSerializer(serializers.ModelSerializer):
    """Serializer para listar pagos"""
    cliente_nombre_completo = serializers.SerializerMethodField()
    metodo_pago_display = serializers.CharField(source='get_metodo_pago_display', read_only=True)
    concepto_display = serializers.CharField(source='get_concepto_display', read_only=True)
    
    class Meta:
        model = Pago
        fields = [
            'id',
            'cliente',
            'cliente_nombre_completo',
            'fecha_pago',
            'monto',
            'metodo_pago',
            'metodo_pago_display',
            'concepto',
            'concepto_display'
        ]
    
    def get_cliente_nombre_completo(self, obj):
        return f"{obj.cliente.nombre} {obj.cliente.apellido}"


class PagoCreateSerializer(serializers.ModelSerializer):
    """Para crear o editar pagos"""
    class Meta:
        model = Pago
        fields = [
            'cliente',
            'membresia',
            'fecha_pago',
            'monto',
            'metodo_pago',
            'concepto',
            'observaciones'
        ]
    
    def validate_monto(self, value):
        """Validar que el monto sea mayor a 0"""
        if value <= 0:
            raise serializers.ValidationError("El monto debe ser mayor a 0")
        return value


# ============================================
# SERIALIZERS PARA GASTO FIJO
# ============================================

class GastoFijoSerializer(serializers.ModelSerializer):
    """Serializer completo de GastoFijo"""
    class Meta:
        model = GastoFijo
        fields = '__all__'


class GastoFijoListSerializer(serializers.ModelSerializer):
    """Serializer para listar gastos fijos"""
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    
    class Meta:
        model = GastoFijo
        fields = [
            'id',
            'nombre',
            'categoria',
            'categoria_display',
            'monto_mensual',
            'dia_vencimiento',
            'activo'
        ]


class GastoFijoCreateSerializer(serializers.ModelSerializer):
    """Para crear o editar gastos fijos"""
    class Meta:
        model = GastoFijo
        fields = [
            'nombre',
            'categoria',
            'monto_mensual',
            'dia_vencimiento',
            'activo',
            'observaciones'
        ]
    
    def validate_monto_mensual(self, value):
        """Validar que el monto sea mayor a 0"""
        if value <= 0:
            raise serializers.ValidationError("El monto mensual debe ser mayor a 0")
        return value
    
    def validate_dia_vencimiento(self, value):
        """Validar que el día esté entre 1 y 31"""
        if value < 1 or value > 31:
            raise serializers.ValidationError("El día de vencimiento debe estar entre 1 y 31")
        return value


# ============================================
# SERIALIZERS PARA EGRESO
# ============================================

class EgresoSerializer(serializers.ModelSerializer):
    """Serializer completo de Egreso"""
    class Meta:
        model = Egreso
        fields = '__all__'


class EgresoListSerializer(serializers.ModelSerializer):
    """Serializer para listar egresos"""
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    metodo_pago_display = serializers.CharField(source='get_metodo_pago_display', read_only=True)
    
    class Meta:
        model = Egreso
        fields = [
            'id',
            'fecha',
            'categoria',
            'categoria_display',
            'descripcion',
            'monto',
            'metodo_pago',
            'metodo_pago_display',
            'proveedor'
        ]


class EgresoCreateSerializer(serializers.ModelSerializer):
    """Para crear o editar egresos"""
    class Meta:
        model = Egreso
        fields = [
            'fecha',
            'categoria',
            'descripcion',
            'monto',
            'metodo_pago',
            'proveedor',
            'comprobante',
            'observaciones'
        ]
    
    def validate_monto(self, value):
        """Validar que el monto sea mayor a 0"""
        if value <= 0:
            raise serializers.ValidationError("El monto debe ser mayor a 0")
        return value


# ============================================
# SERIALIZERS PARA ESTADO DE CUENTA
# ============================================

class EstadoCuentaSerializer(serializers.ModelSerializer):
    """Serializer completo de EstadoCuenta"""
    class Meta:
        model = EstadoCuenta
        fields = '__all__'


class EstadoCuentaListSerializer(serializers.ModelSerializer):
    """Serializer para listar estados de cuenta"""
    cliente_nombre_completo = serializers.SerializerMethodField()
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = EstadoCuenta
        fields = [
            'id',
            'cliente',
            'cliente_nombre_completo',
            'saldo_pendiente',
            'ultimo_pago',
            'proximo_vencimiento',
            'estado',
            'estado_display'
        ]
    
    def get_cliente_nombre_completo(self, obj):
        return f"{obj.cliente.nombre} {obj.cliente.apellido}"


class EstadoCuentaCreateSerializer(serializers.ModelSerializer):
    """Para crear o editar estados de cuenta"""
    class Meta:
        model = EstadoCuenta
        fields = [
            'cliente',
            'membresia_activa',
            'saldo_pendiente',
            'ultimo_pago',
            'proximo_vencimiento',
            'estado',
            'observaciones'
        ]
    
    def validate_saldo_pendiente(self, value):
        """Validar que el saldo sea mayor o igual a 0"""
        if value < 0:
            raise serializers.ValidationError("El saldo pendiente no puede ser negativo")
        return value
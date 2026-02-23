from rest_framework import serializers
from .models import RegistroAcceso


class RegistroAccesoSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.SerializerMethodField()
    plan_nombre = serializers.SerializerMethodField()

    class Meta:
        model = RegistroAcceso
        fields = [
            'id',
            'dni_ingresado',
            'cliente_nombre',
            'plan_nombre',
            'fecha_hora',
            'resultado',
            'motivo_denegacion',
            'dias_restantes',
        ]

    def get_cliente_nombre(self, obj):
        if obj.cliente:
            return f"{obj.cliente.nombre} {obj.cliente.apellido}"
        return None

    def get_plan_nombre(self, obj):
        if obj.membresia:
            return obj.membresia.plan.nombre
        return None

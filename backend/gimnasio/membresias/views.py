from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import date, timedelta
from .models import Ejercicio, Plan, Membresia
from .serializers import (
    EjercicioSerializer,
    PlanSerializer,
    PlanListSerializer,
    PlanCreateSerializer,
    PlanDetalleSerializer,
    MembresiaSerializer,
    MembresiaListSerializer,
    MembresiaCreateSerializer 
)


class EjercicioViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar ejercicios"""
    queryset = Ejercicio.objects.all()
    serializer_class = EjercicioSerializer
    
    def get_queryset(self):
        queryset = Ejercicio.objects.all()
        
        activo = self.request.query_params.get('activo', None)
        if activo == 'true':
            queryset = queryset.filter(activo=True)
        
        categoria = self.request.query_params.get('categoria', None)
        if categoria:
            queryset = queryset.filter(categoria=categoria)
        
        return queryset


class PlanViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar planes de membresía"""
    queryset = Plan.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PlanListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PlanCreateSerializer
        elif self.action == 'retrieve':
            return PlanDetalleSerializer
        return PlanSerializer
    
    def get_queryset(self):
        queryset = Plan.objects.all()
        
        activo = self.request.query_params.get('activo', None)
        if activo == 'true':
            queryset = queryset.filter(activo=True)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def activos(self, request):
        planes = Plan.objects.filter(activo=True)
        serializer = PlanListSerializer(planes, many=True)
        return Response(serializer.data)


class MembresiaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar membresías"""
    queryset = Membresia.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MembresiaListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return MembresiaCreateSerializer 
        return MembresiaSerializer
    
    def get_queryset(self):
        queryset = Membresia.objects.all()
        
        estado = self.request.query_params.get('estado', None)
        if estado:
            queryset = queryset.filter(estado=estado)
        
        cliente_id = self.request.query_params.get('cliente', None)
        if cliente_id:
            queryset = queryset.filter(cliente_id=cliente_id)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def activas(self, request):
        membresias = Membresia.objects.filter(estado='activa')
        serializer = MembresiaListSerializer(membresias, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def por_vencer(self, request):
        hoy = date.today()
        fecha_limite = hoy + timedelta(days=7)
        
        membresias = Membresia.objects.filter(
            estado='activa',
            fecha_fin__gte=hoy,
            fecha_fin__lte=fecha_limite
        )
        
        serializer = MembresiaListSerializer(membresias, many=True)
        return Response(serializer.data)
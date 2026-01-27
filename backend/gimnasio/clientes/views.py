from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import date, timedelta
from .models import Cliente, Huella, Recordatorio
from .serializers import (
    ClienteSerializer,
    ClienteListSerializer,
    ClienteCreateSerializer,
    ClienteDetalleSerializer,
    RecordatorioSerializer,
    RecordatorioListSerializer,
    RecordatorioCreateSerializer
)


# ============================================
# VIEWSET PARA CLIENTES
# ============================================

class ClienteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar clientes del gimnasio.
    
    Operaciones automáticas:
    - GET /clientes/ -> Lista todos
    - POST /clientes/ -> Crea nuevo cliente
    - GET /clientes/{id}/ -> Detalle de un cliente
    - PUT /clientes/{id}/ -> Actualiza cliente completo
    - PATCH /clientes/{id}/ -> Actualiza cliente parcial
    - DELETE /clientes/{id}/ -> Elimina cliente (mejor usar desactivar)
    """
    queryset = Cliente.objects.all()
    
    def get_serializer_class(self):
        """Elige el serializer según la acción"""
        if self.action == 'list':
            return ClienteListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ClienteCreateSerializer
        elif self.action == 'retrieve':
            return ClienteDetalleSerializer
        return ClienteSerializer
    
    def get_queryset(self):
        """Permite filtrar clientes por diferentes criterios"""
        queryset = Cliente.objects.all()
        
        # Filtrar solo clientes activos
        activo = self.request.query_params.get('activo', None)
        if activo == 'true':
            queryset = queryset.filter(activo=True)
        elif activo == 'false':
            queryset = queryset.filter(activo=False)
        
        # Buscar por DNI
        dni = self.request.query_params.get('dni', None)
        if dni:
            queryset = queryset.filter(dni=dni)
        
        # Buscar por nombre o apellido
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                nombre__icontains=search
            ) | queryset.filter(
                apellido__icontains=search
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def activos(self, request):
        """
        Endpoint personalizado: /clientes/activos/
        Devuelve solo clientes activos
        """
        clientes = Cliente.objects.filter(activo=True)
        serializer = ClienteListSerializer(clientes, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def desactivar(self, request, pk=None):
        """
        Endpoint personalizado: POST /clientes/{id}/desactivar/
        Desactiva un cliente en lugar de eliminarlo
        """
        cliente = self.get_object()
        cliente.activo = False
        cliente.save()
        serializer = self.get_serializer(cliente)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def activar(self, request, pk=None):
        """
        Endpoint personalizado: POST /clientes/{id}/activar/
        Reactiva un cliente desactivado
        """
        cliente = self.get_object()
        cliente.activo = True
        cliente.save()
        serializer = self.get_serializer(cliente)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def cumpleanos_mes(self, request):
        """
        Endpoint personalizado: /clientes/cumpleanos_mes/
        Devuelve clientes que cumplen años este mes
        """
        hoy = date.today()
        mes_actual = hoy.month
        
        clientes = Cliente.objects.filter(
            fecha_nacimiento__month=mes_actual,
            activo=True
        )
        
        serializer = ClienteListSerializer(clientes, many=True)
        return Response(serializer.data)


# ============================================
# VIEWSET PARA HUELLAS
# ============================================

class HuellaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar huellas digitales de clientes.
    
    Importante: La huella es OneToOne con Cliente,
    así que cada cliente tiene máximo una huella.
    
    NOTA: Falta crear HuellaSerializer
    """
    queryset = Huella.objects.all()
    # serializer_class = HuellaSerializer  # TODO: Crear después
    
    def get_queryset(self):
        """Permite filtrar huellas"""
        queryset = Huella.objects.all()
        
        # Filtrar por cliente
        cliente_id = self.request.query_params.get('cliente', None)
        if cliente_id:
            queryset = queryset.filter(cliente_id=cliente_id)
        
        # Solo huellas activas
        activa = self.request.query_params.get('activa', None)
        if activa == 'true':
            queryset = queryset.filter(activa=True)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def desactivar(self, request, pk=None):
        """
        Endpoint: POST /huellas/{id}/desactivar/
        Desactiva una huella (por ejemplo, si está dañada)
        """
        huella = self.get_object()
        huella.activa = False
        huella.save()
        return Response({"message": f"Huella de {huella.cliente} desactivada"})


# ============================================
# VIEWSET PARA RECORDATORIOS
# ============================================

class RecordatorioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar recordatorios automáticos.
    
    Los recordatorios pueden ser de:
    - Vencimiento de membresía
    - Deudas pendientes
    - Renovación
    """
    queryset = Recordatorio.objects.all()
    
    def get_serializer_class(self):
        """Elige el serializer según la acción"""
        if self.action == 'list':
            return RecordatorioListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return RecordatorioCreateSerializer
        return RecordatorioSerializer
    
    def get_queryset(self):
        """Permite filtrar recordatorios"""
        queryset = Recordatorio.objects.all()
        
        # Filtrar por cliente
        cliente_id = self.request.query_params.get('cliente', None)
        if cliente_id:
            queryset = queryset.filter(cliente_id=cliente_id)
        
        # Filtrar por estado (pendiente, enviado, cancelado)
        estado = self.request.query_params.get('estado', None)
        if estado:
            queryset = queryset.filter(estado=estado)
        
        # Filtrar por tipo (vencimiento, deuda, renovacion)
        tipo = self.request.query_params.get('tipo', None)
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """
        Endpoint: /recordatorios/pendientes/
        Devuelve recordatorios pendientes de envío
        """
        recordatorios = Recordatorio.objects.filter(estado='pendiente')
        serializer = self.get_serializer(recordatorios, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def hoy(self, request):
        """
        Endpoint: /recordatorios/hoy/
        Devuelve recordatorios programados para hoy
        """
        hoy = date.today()
        recordatorios = Recordatorio.objects.filter(
            fecha_programada__date=hoy,
            estado='pendiente'
        )
        serializer = self.get_serializer(recordatorios, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def enviar(self, request, pk=None):
        """
        Endpoint: POST /recordatorios/{id}/enviar/
        Marca un recordatorio como enviado
        """
        from datetime import datetime
        
        recordatorio = self.get_object()
        recordatorio.estado = 'enviado'
        recordatorio.fecha_envio = datetime.now()
        recordatorio.save()
        
        return Response({
            "message": f"Recordatorio enviado a {recordatorio.cliente}",
            "canal": recordatorio.canal
        })
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """
        Endpoint: POST /recordatorios/{id}/cancelar/
        Cancela un recordatorio pendiente
        """
        recordatorio = self.get_object()
        recordatorio.estado = 'cancelado'
        recordatorio.save()
        
        return Response({"message": "Recordatorio cancelado"})
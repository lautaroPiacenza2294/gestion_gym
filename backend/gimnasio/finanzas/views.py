from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import date, timedelta
from django.db.models import Sum
from .models import Pago, GastoFijo, Egreso, EstadoCuenta
from .serializers import (
    PagoSerializer,
    PagoListSerializer,
    PagoCreateSerializer,
    GastoFijoSerializer,
    GastoFijoListSerializer,
    GastoFijoCreateSerializer,
    EgresoSerializer,
    EgresoListSerializer,
    EgresoCreateSerializer,
    EstadoCuentaSerializer,
    EstadoCuentaListSerializer,
    EstadoCuentaCreateSerializer
)


class PagoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar pagos"""
    queryset = Pago.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PagoListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PagoCreateSerializer
        return PagoSerializer
    
    def get_queryset(self):
        queryset = Pago.objects.all()
        
        cliente_id = self.request.query_params.get('cliente', None)
        if cliente_id:
            queryset = queryset.filter(cliente_id=cliente_id)
        
        membresia_id = self.request.query_params.get('membresia', None)
        if membresia_id:
            queryset = queryset.filter(membresia_id=membresia_id)
        
        metodo_pago = self.request.query_params.get('metodo_pago', None)
        if metodo_pago:
            queryset = queryset.filter(metodo_pago=metodo_pago)
        
        concepto = self.request.query_params.get('concepto', None)
        if concepto:
            queryset = queryset.filter(concepto=concepto)
        
        fecha_desde = self.request.query_params.get('fecha_desde', None)
        fecha_hasta = self.request.query_params.get('fecha_hasta', None)
        
        if fecha_desde:
            queryset = queryset.filter(fecha_pago__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha_pago__lte=fecha_hasta)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def hoy(self, request):
        hoy = date.today()
        pagos = Pago.objects.filter(fecha_pago=hoy)
        serializer = PagoListSerializer(pagos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def mes_actual(self, request):
        hoy = date.today()
        pagos = Pago.objects.filter(
            fecha_pago__year=hoy.year,
            fecha_pago__month=hoy.month
        )
        serializer = PagoListSerializer(pagos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def total_mes(self, request):
        hoy = date.today()
        total = Pago.objects.filter(
            fecha_pago__year=hoy.year,
            fecha_pago__month=hoy.month
        ).aggregate(total=Sum('monto'))['total'] or 0
        
        return Response({
            "mes": hoy.strftime("%B %Y"),
            "total": float(total),
            "total_formateado": f"${total:,.2f}"
        })


class GastoFijoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar gastos fijos"""
    queryset = GastoFijo.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return GastoFijoListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return GastoFijoCreateSerializer
        return GastoFijoSerializer
    
    def get_queryset(self):
        queryset = GastoFijo.objects.all()
        
        activo = self.request.query_params.get('activo', None)
        if activo == 'true':
            queryset = queryset.filter(activo=True)
        elif activo == 'false':
            queryset = queryset.filter(activo=False)
        
        categoria = self.request.query_params.get('categoria', None)
        if categoria:
            queryset = queryset.filter(categoria=categoria)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def activos(self, request):
        gastos = GastoFijo.objects.filter(activo=True)
        serializer = GastoFijoListSerializer(gastos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def total_mensual(self, request):
        total = GastoFijo.objects.filter(activo=True).aggregate(
            total=Sum('monto_mensual')
        )['total'] or 0
        
        return Response({
            "total_mensual": float(total),
            "total_formateado": f"${total:,.2f}"
        })
    
    @action(detail=False, methods=['get'])
    def proximos_vencimientos(self, request):
        hoy = date.today()
        dia_actual = hoy.day
        dia_limite = (hoy + timedelta(days=7)).day
        
        if dia_limite < dia_actual:
            gastos = GastoFijo.objects.filter(
                activo=True
            ).filter(
                dia_vencimiento__gte=dia_actual
            ) | GastoFijo.objects.filter(
                activo=True,
                dia_vencimiento__lte=dia_limite
            )
        else:
            gastos = GastoFijo.objects.filter(
                activo=True,
                dia_vencimiento__gte=dia_actual,
                dia_vencimiento__lte=dia_limite
            )
        
        serializer = GastoFijoListSerializer(gastos, many=True)
        return Response(serializer.data)


class EgresoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar egresos"""
    queryset = Egreso.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EgresoListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return EgresoCreateSerializer
        return EgresoSerializer
    
    def get_queryset(self):
        queryset = Egreso.objects.all()
        
        categoria = self.request.query_params.get('categoria', None)
        if categoria:
            queryset = queryset.filter(categoria=categoria)
        
        metodo_pago = self.request.query_params.get('metodo_pago', None)
        if metodo_pago:
            queryset = queryset.filter(metodo_pago=metodo_pago)
        
        fecha_desde = self.request.query_params.get('fecha_desde', None)
        fecha_hasta = self.request.query_params.get('fecha_hasta', None)
        
        if fecha_desde:
            queryset = queryset.filter(fecha__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha__lte=fecha_hasta)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def mes_actual(self, request):
        hoy = date.today()
        egresos = Egreso.objects.filter(
            fecha__year=hoy.year,
            fecha__month=hoy.month
        )
        serializer = EgresoListSerializer(egresos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def total_mes(self, request):
        hoy = date.today()
        total = Egreso.objects.filter(
            fecha__year=hoy.year,
            fecha__month=hoy.month
        ).aggregate(total=Sum('monto'))['total'] or 0
        
        return Response({
            "mes": hoy.strftime("%B %Y"),
            "total": float(total),
            "total_formateado": f"${total:,.2f}"
        })


class EstadoCuentaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar estados de cuenta"""
    queryset = EstadoCuenta.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EstadoCuentaListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return EstadoCuentaCreateSerializer
        return EstadoCuentaSerializer
    
    def get_queryset(self):
        queryset = EstadoCuenta.objects.all()
        
        estado = self.request.query_params.get('estado', None)
        if estado:
            queryset = queryset.filter(estado=estado)
        
        cliente_id = self.request.query_params.get('cliente', None)
        if cliente_id:
            queryset = queryset.filter(cliente_id=cliente_id)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def morosos(self, request):
        estados = EstadoCuenta.objects.filter(estado='debe')
        serializer = EstadoCuentaListSerializer(estados, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def al_dia(self, request):
        estados = EstadoCuenta.objects.filter(estado='al_dia')
        serializer = EstadoCuentaListSerializer(estados, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def suspendidos(self, request):
        estados = EstadoCuenta.objects.filter(estado='suspendido')
        serializer = EstadoCuentaListSerializer(estados, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def proximos_vencimientos(self, request):
        hoy = date.today()
        fecha_limite = hoy + timedelta(days=7)
        
        estados = EstadoCuenta.objects.filter(
            proximo_vencimiento__gte=hoy,
            proximo_vencimiento__lte=fecha_limite
        )
        
        serializer = EstadoCuentaListSerializer(estados, many=True)
        return Response(serializer.data)
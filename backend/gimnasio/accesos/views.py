from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import date

from clientes.models import Cliente
from membresias.models import Membresia
from .models import RegistroAcceso
from .serializers import RegistroAccesoSerializer


class AccesoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RegistroAcceso.objects.all()
    serializer_class = RegistroAccesoSerializer

    def get_queryset(self):
        queryset = RegistroAcceso.objects.all()
        fecha = self.request.query_params.get('fecha', None)
        if fecha:
            queryset = queryset.filter(fecha_hora__date=fecha)
        return queryset

    @action(detail=False, methods=['post'])
    def buscar(self, request):
        """
        POST /api/accesos/acceso/buscar/
        Busca el cliente por DNI para mostrar en la pantalla de confirmación.
        NO registra ningún acceso — solo devuelve info previa.
        """
        dni = request.data.get('dni', '').strip()

        if not dni:
            return Response({'error': 'DNI requerido'}, status=status.HTTP_400_BAD_REQUEST)

        hoy = date.today()

        try:
            cliente = Cliente.objects.get(dni=dni)
        except Cliente.DoesNotExist:
            return Response({
                'encontrado': False,
                'puede_entrar': False,
                'motivo': 'no_encontrado',
            })

        if not cliente.activo:
            return Response({
                'encontrado': True,
                'puede_entrar': False,
                'cliente': f"{cliente.nombre} {cliente.apellido}",
                'motivo': 'cliente_inactivo',
            })

        membresia = Membresia.objects.filter(
            cliente=cliente,
            estado='activa',
            fecha_fin__gte=hoy
        ).order_by('-fecha_fin').first()

        if not membresia:
            tiene_vencida = Membresia.objects.filter(cliente=cliente).exists()
            motivo = 'membresia_vencida' if tiene_vencida else 'sin_membresia'
            return Response({
                'encontrado': True,
                'puede_entrar': False,
                'cliente': f"{cliente.nombre} {cliente.apellido}",
                'motivo': motivo,
            })

        dias_restantes = (membresia.fecha_fin - hoy).days
        return Response({
            'encontrado': True,
            'puede_entrar': True,
            'cliente': f"{cliente.nombre} {cliente.apellido}",
            'plan': membresia.plan.nombre,
            'dias_restantes': dias_restantes,
        })

    @action(detail=False, methods=['post'])
    def validar(self, request):
        """
        POST /api/accesos/acceso/validar/
        Recibe {dni}, valida la membresía, registra el intento y devuelve el resultado.
        """
        dni = request.data.get('dni', '').strip()

        if not dni:
            return Response(
                {'error': 'El DNI es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        hoy = date.today()

        # 1. Buscar cliente por DNI
        try:
            cliente = Cliente.objects.get(dni=dni)
        except Cliente.DoesNotExist:
            RegistroAcceso.objects.create(
                dni_ingresado=dni,
                resultado='denegado',
                motivo_denegacion='no_encontrado'
            )
            return Response({
                'resultado': 'denegado',
                'motivo': 'no_encontrado',
                'mensaje': 'DNI no registrado en el sistema',
            })

        # 2. Verificar que el cliente esté activo
        if not cliente.activo:
            RegistroAcceso.objects.create(
                cliente=cliente,
                dni_ingresado=dni,
                resultado='denegado',
                motivo_denegacion='cliente_inactivo'
            )
            return Response({
                'resultado': 'denegado',
                'motivo': 'cliente_inactivo',
                'mensaje': 'Cliente inactivo',
                'cliente': f"{cliente.nombre} {cliente.apellido}",
            })

        # 3. Buscar membresía activa y vigente
        membresia = Membresia.objects.filter(
            cliente=cliente,
            estado='activa',
            fecha_fin__gte=hoy
        ).order_by('-fecha_fin').first()

        if not membresia:
            tiene_vencida = Membresia.objects.filter(
                cliente=cliente
            ).exists()
            motivo = 'membresia_vencida' if tiene_vencida else 'sin_membresia'

            RegistroAcceso.objects.create(
                cliente=cliente,
                dni_ingresado=dni,
                resultado='denegado',
                motivo_denegacion=motivo
            )
            return Response({
                'resultado': 'denegado',
                'motivo': motivo,
                'mensaje': 'Membresía vencida' if motivo == 'membresia_vencida' else 'Sin membresía activa',
                'cliente': f"{cliente.nombre} {cliente.apellido}",
            })

        # 4. Acceso permitido
        dias_restantes = (membresia.fecha_fin - hoy).days

        RegistroAcceso.objects.create(
            cliente=cliente,
            dni_ingresado=dni,
            resultado='permitido',
            membresia=membresia,
            dias_restantes=dias_restantes
        )

        return Response({
            'resultado': 'permitido',
            'cliente': f"{cliente.nombre} {cliente.apellido}",
            'plan': membresia.plan.nombre,
            'frecuencia_semanal': membresia.plan.frecuencia_semanal,
            'fecha_fin': membresia.fecha_fin.isoformat(),
            'dias_restantes': dias_restantes,
        })

    @action(detail=False, methods=['get'])
    def hoy(self, request):
        """
        GET /api/accesos/acceso/hoy/
        Devuelve todos los registros de acceso del día actual.
        """
        hoy = date.today()
        accesos = RegistroAcceso.objects.filter(fecha_hora__date=hoy)
        serializer = self.get_serializer(accesos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats_hoy(self, request):
        """
        GET /api/accesos/acceso/stats_hoy/
        Estadísticas del día: total, permitidos, denegados.
        """
        hoy = date.today()
        accesos = RegistroAcceso.objects.filter(fecha_hora__date=hoy)
        total = accesos.count()
        permitidos = accesos.filter(resultado='permitido').count()
        denegados = accesos.filter(resultado='denegado').count()

        return Response({
            'total': total,
            'permitidos': permitidos,
            'denegados': denegados,
        })

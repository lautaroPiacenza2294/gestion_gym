# api/views/dashboard.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from datetime import datetime, timedelta, date

from clientes.models import Cliente, Recordatorio
from membresias.models import Membresia, Plan
from finanzas.models import Pago


@api_view(['GET'])
def dashboard_overview(request):
    """
    Endpoint único que devuelve TODO lo que necesita el Dashboard.
    GET /api/dashboard/overview/

    Devuelve:
    - KPIs (4 tarjetas — sin datos monetarios)
    - Datos del gráfico (socios por plan)
    - Alertas (membresías por vencer, recordatorios, socios sin membresía)
    - Actividad reciente (nuevos clientes, renovaciones — sin pagos)
    """

    hoy = date.today()
    mes_actual = hoy.month
    ano_actual = hoy.year

    # Calcular mes anterior
    primer_dia_mes = hoy.replace(day=1)
    ultimo_dia_mes_anterior = primer_dia_mes - timedelta(days=1)
    mes_anterior = ultimo_dia_mes_anterior.month
    ano_anterior = ultimo_dia_mes_anterior.year

    # ============================================
    # 1. CALCULAR KPIs
    # ============================================

    # --- CLIENTES ACTIVOS ---
    clientes_activos = Cliente.objects.filter(activo=True).count()

    clientes_mes_anterior = Cliente.objects.filter(
        activo=True,
        fecha_registro__lt=primer_dia_mes
    ).count()

    if clientes_mes_anterior > 0:
        cambio_clientes = round(
            ((clientes_activos - clientes_mes_anterior) / clientes_mes_anterior) * 100
        )
    else:
        cambio_clientes = 100 if clientes_activos > 0 else 0

    # --- MEMBRESÍAS ACTIVAS ---
    membresias_activas = Membresia.objects.filter(estado='activa').count()

    membresias_mes_anterior = Membresia.objects.filter(
        estado='activa',
        fecha_inicio__lt=primer_dia_mes
    ).count()

    if membresias_mes_anterior > 0:
        cambio_membresias = round(
            ((membresias_activas - membresias_mes_anterior) / membresias_mes_anterior) * 100
        )
    else:
        cambio_membresias = 100 if membresias_activas > 0 else 0

    # --- MEMBRESÍAS POR VENCER (próximos 7 días) ---
    fecha_limite = hoy + timedelta(days=7)
    membresias_por_vencer = Membresia.objects.filter(
        estado='activa',
        fecha_fin__gte=hoy,
        fecha_fin__lte=fecha_limite
    ).count()

    # --- NUEVOS SOCIOS ESTE MES ---
    nuevos_socios_mes = Cliente.objects.filter(
        fecha_registro__year=ano_actual,
        fecha_registro__month=mes_actual
    ).count()

    nuevos_socios_mes_anterior = Cliente.objects.filter(
        fecha_registro__year=ano_anterior,
        fecha_registro__month=mes_anterior
    ).count()

    if nuevos_socios_mes_anterior > 0:
        cambio_nuevos = round(
            ((nuevos_socios_mes - nuevos_socios_mes_anterior) / nuevos_socios_mes_anterior) * 100
        )
    else:
        cambio_nuevos = 100 if nuevos_socios_mes > 0 else 0

    kpis = {
        'clientes_activos': {
            'value': clientes_activos,
            'change': f"{abs(cambio_clientes)}%",
            'trend': 'up' if cambio_clientes >= 0 else 'down'
        },
        'membresias_activas': {
            'value': membresias_activas,
            'change': f"{abs(cambio_membresias)}%",
            'trend': 'up' if cambio_membresias >= 0 else 'down'
        },
        'membresias_por_vencer': {
            'value': membresias_por_vencer,
            'change': 'proximos 7 dias',
            'trend': 'down' if membresias_por_vencer > 0 else 'up'
        },
        'nuevos_socios_mes': {
            'value': nuevos_socios_mes,
            'change': f"{abs(cambio_nuevos)}%",
            'trend': 'up' if cambio_nuevos >= 0 else 'down'
        }
    }

    # ============================================
    # 2. DATOS PARA EL GRÁFICO (Socios por Plan)
    # ============================================

    planes_data = list(
        Plan.objects.annotate(
            total=Count('membresias', filter=Q(membresias__estado='activa'))
        ).values('nombre', 'total').order_by('-total')
    )

    chart_data = planes_data

    # ============================================
    # 3. ALERTAS
    # ============================================

    # Recordatorios pendientes para hoy
    recordatorios_hoy = Recordatorio.objects.filter(
        estado='pendiente',
        fecha_programada__date=hoy
    ).count()

    # Socios activos sin ninguna membresía activa
    socios_sin_membresia = Cliente.objects.filter(
        activo=True
    ).exclude(
        membresias__estado='activa'
    ).distinct().count()

    alertas = [
        {
            'cantidad': str(membresias_por_vencer),
            'titulo': 'Membresias por vencer',
            'desc': 'En los proximos 7 dias',
            'bg': 'bg-red-50',
            'text': 'text-red-700',
            'border': 'border-red-100'
        },
        {
            'cantidad': str(recordatorios_hoy),
            'titulo': 'Recordatorios hoy',
            'desc': 'Pendientes de revision',
            'bg': 'bg-amber-50',
            'text': 'text-amber-700',
            'border': 'border-amber-100'
        },
        {
            'cantidad': str(socios_sin_membresia),
            'titulo': 'Socios sin membresia',
            'desc': 'Clientes activos sin plan activo',
            'bg': 'bg-blue-50',
            'text': 'text-blue-700',
            'border': 'border-blue-100'
        }
    ]

    # ============================================
    # 4. ACTIVIDAD RECIENTE (sin pagos ni montos)
    # ============================================

    actividades = []

    # Ultimos 3 clientes nuevos
    nuevos_clientes = Cliente.objects.filter(activo=True).order_by('-fecha_registro')[:3]

    for cliente in nuevos_clientes:
        actividades.append({
            'tipo': 'cliente_nuevo',
            'titulo': 'Nuevo cliente registrado',
            'desc': f'{cliente.nombre} {cliente.apellido} - DNI {cliente.dni}',
            'hora': calcular_hora_relativa(cliente.fecha_registro),
            'color': 'bg-indigo-500'
        })

    # Ultimas 3 renovaciones
    renovaciones = Membresia.objects.filter(
        estado='activa'
    ).select_related('cliente', 'plan').order_by('-fecha_creacion')[:3]

    for membresia in renovaciones:
        actividades.append({
            'tipo': 'renovacion',
            'titulo': 'Membresia renovada',
            'desc': f'{membresia.cliente.nombre} {membresia.cliente.apellido} - {membresia.plan.nombre}',
            'hora': calcular_hora_relativa(membresia.fecha_creacion),
            'color': 'bg-amber-500'
        })

    # Tomar solo las 5 mas recientes
    actividades = actividades[:5]

    # ============================================
    # RESPUESTA FINAL
    # ============================================

    return Response({
        'kpis': kpis,
        'chart_data': chart_data,
        'alertas': alertas,
        'actividad': actividades
    })


def calcular_hora_relativa(fecha):
    """
    Convierte una fecha en texto relativo.
    Ej: "Hace 2h", "Ayer", "Hace 3 dias"
    """
    ahora = datetime.now()

    if fecha.tzinfo is not None:
        fecha = fecha.replace(tzinfo=None)

    diferencia = ahora - fecha

    if diferencia.days == 0:
        horas = diferencia.seconds // 3600
        if horas == 0:
            minutos = diferencia.seconds // 60
            if minutos < 1:
                return "Ahora"
            return f"Hace {minutos} min"
        return f"Hace {horas}h"

    elif diferencia.days == 1:
        return "Ayer"

    elif diferencia.days < 7:
        return f"Hace {diferencia.days} dias"

    else:
        return fecha.strftime("%d/%m/%Y")

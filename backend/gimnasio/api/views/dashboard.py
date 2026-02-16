# api/views/dashboard.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum, Count
from datetime import datetime, timedelta, date

from clientes.models import Cliente, Recordatorio
from membresias.models import Membresia
from finanzas.models import Pago, Egreso, EstadoCuenta


@api_view(['GET'])
def dashboard_overview(request):
    """
    Endpoint único que devuelve TODO lo que necesita el Dashboard.
    GET /api/dashboard/overview/
    
    Devuelve:
    - KPIs (4 tarjetas principales)
    - Datos del gráfico (ingresos vs egresos)
    - Alertas (membresías por vencer, recordatorios, gastos)
    - Actividad reciente (pagos, nuevos clientes, renovaciones)
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
    
    # Clientes activos el mes anterior
    clientes_mes_anterior = Cliente.objects.filter(
        activo=True,
        fecha_registro__lt=primer_dia_mes
    ).count()
    
    # Calcular cambio porcentual
    if clientes_mes_anterior > 0:
        cambio_clientes = round(
            ((clientes_activos - clientes_mes_anterior) / clientes_mes_anterior) * 100
        )
    else:
        cambio_clientes = 100 if clientes_activos > 0 else 0
    
    # --- MEMBRESÍAS ACTIVAS ---
    membresias_activas = Membresia.objects.filter(estado='activa').count()
    
    # Membresías del mes anterior
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
    
    # --- INGRESOS DEL MES ---
    ingresos_mes = Pago.objects.filter(
        fecha_pago__year=ano_actual,
        fecha_pago__month=mes_actual
    ).aggregate(total=Sum('monto'))['total'] or 0
    
    # Ingresos del mes anterior
    ingresos_mes_anterior = Pago.objects.filter(
        fecha_pago__year=ano_anterior,
        fecha_pago__month=mes_anterior
    ).aggregate(total=Sum('monto'))['total'] or 0
    
    if ingresos_mes_anterior > 0:
        cambio_ingresos = round(
            ((ingresos_mes - ingresos_mes_anterior) / ingresos_mes_anterior) * 100
        )
    else:
        cambio_ingresos = 100 if ingresos_mes > 0 else 0
    
    # --- CLIENTES MOROSOS ---
    clientes_morosos = EstadoCuenta.objects.filter(estado='debe').count()
    
    # Estructura de KPIs
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
        'ingresos_mes': {
            'value': f"${int(ingresos_mes):,}",
            'change': f"{abs(cambio_ingresos)}%",
            'trend': 'up' if cambio_ingresos >= 0 else 'down'
        },
        'clientes_morosos': {
            'value': clientes_morosos,
            'change': '3',
            'trend': 'down'
        }
    }
    
    # ============================================
    # 2. DATOS PARA EL GRÁFICO
    # ============================================
    
    chart_data = []
    dias_muestra = [1, 5, 10, 15, 20, 25, 30]
    
    for dia in dias_muestra:
        # Ingresos acumulados hasta ese día
        ingresos_hasta_dia = Pago.objects.filter(
            fecha_pago__year=ano_actual,
            fecha_pago__month=mes_actual,
            fecha_pago__day__lte=dia
        ).aggregate(total=Sum('monto'))['total'] or 0
        
        # Egresos acumulados hasta ese día
        egresos_hasta_dia = Egreso.objects.filter(
            fecha__year=ano_actual,
            fecha__month=mes_actual,
            fecha__day__lte=dia
        ).aggregate(total=Sum('monto'))['total'] or 0
        
        chart_data.append({
            'dia': str(dia),
            'ingresos': int(ingresos_hasta_dia),
            'egresos': int(egresos_hasta_dia)
        })
    
    # ============================================
    # 3. ALERTAS
    # ============================================
    
    # Membresías por vencer en los próximos 7 días
    fecha_limite = hoy + timedelta(days=7)
    membresias_por_vencer = Membresia.objects.filter(
        estado='activa',
        fecha_fin__gte=hoy,
        fecha_fin__lte=fecha_limite
    ).count()
    
    # Recordatorios pendientes para hoy
    recordatorios_hoy = Recordatorio.objects.filter(
        estado='pendiente',
        fecha_programada__date=hoy
    ).count()
    
    # Gastos fijos próximos (simplificado por ahora)
    gastos_proximos = 3
    
    alertas = [
        {
            'cantidad': str(membresias_por_vencer),
            'titulo': 'Membresías por vencer',
            'desc': 'En los próximos 7 días',
            'bg': 'bg-red-50',
            'text': 'text-red-700',
            'border': 'border-red-100'
        },
        {
            'cantidad': str(recordatorios_hoy),
            'titulo': 'Recordatorios hoy',
            'desc': 'Pendientes de revisión',
            'bg': 'bg-amber-50',
            'text': 'text-amber-700',
            'border': 'border-amber-100'
        },
        {
            'cantidad': str(gastos_proximos),
            'titulo': 'Gastos próximos',
            'desc': 'Vencen esta semana',
            'bg': 'bg-emerald-50',
            'text': 'text-emerald-700',
            'border': 'border-emerald-100'
        }
    ]
    
    # ============================================
    # 4. ACTIVIDAD RECIENTE
    # ============================================
    
    actividades = []
    
    # Últimos 3 pagos
    ultimos_pagos = Pago.objects.select_related('cliente').order_by('-fecha_registro')[:3]
    
    for pago in ultimos_pagos:
        actividades.append({
            'tipo': 'pago',
            'titulo': f'{pago.cliente.nombre} {pago.cliente.apellido} realizó un pago',
            'desc': f'Pago de {pago.get_concepto_display()} - ${pago.monto:,}',
            'hora': calcular_hora_relativa(pago.fecha_registro),
            'color': 'bg-emerald-500'
        })
    
    # Últimos 2 clientes nuevos
    nuevos_clientes = Cliente.objects.filter(activo=True).order_by('-fecha_registro')[:2]
    
    for cliente in nuevos_clientes:
        actividades.append({
            'tipo': 'cliente_nuevo',
            'titulo': 'Nuevo cliente registrado',
            'desc': f'{cliente.nombre} {cliente.apellido} - DNI {cliente.dni}',
            'hora': calcular_hora_relativa(cliente.fecha_registro),
            'color': 'bg-indigo-500'
        })
    
    # Últimas 2 renovaciones
    renovaciones = Membresia.objects.filter(
        estado='activa'
    ).select_related('cliente', 'plan').order_by('-fecha_creacion')[:2]
    
    for membresia in renovaciones:
        actividades.append({
            'tipo': 'renovacion',
            'titulo': 'Renovación de membresía',
            'desc': f'{membresia.cliente.nombre} {membresia.cliente.apellido} - {membresia.plan.nombre}',
            'hora': calcular_hora_relativa(membresia.fecha_creacion),
            'color': 'bg-amber-500'
        })
    
    # Tomar solo las últimas 5 actividades
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
    Ej: "Hace 2h", "Ayer", "Hace 3 días"
    """
    # Hacer la fecha "naive" (sin timezone) para comparar
    ahora = datetime.now()
    
    if fecha.tzinfo is not None:
        fecha = fecha.replace(tzinfo=None)
    
    diferencia = ahora - fecha
    
    # Hoy
    if diferencia.days == 0:
        horas = diferencia.seconds // 3600
        if horas == 0:
            minutos = diferencia.seconds // 60
            if minutos < 1:
                return "Ahora"
            return f"Hace {minutos} min"
        return f"Hace {horas}h"
    
    # Ayer
    elif diferencia.days == 1:
        return "Ayer"
    
    # Hace X días
    elif diferencia.days < 7:
        return f"Hace {diferencia.days} días"
    
    # Fecha exacta
    else:
        return fecha.strftime("%d/%m/%Y")
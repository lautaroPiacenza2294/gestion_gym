# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from clientes.views import ClienteViewSet, RecordatorioViewSet, HuellaViewSet
from membresias.views import PlanViewSet, MembresiaViewSet, EjercicioViewSet
from finanzas.views import PagoViewSet, GastoFijoViewSet, EgresoViewSet, EstadoCuentaViewSet

# Importar vista del dashboard
from .views.dashboard import dashboard_overview

# Router para ViewSets
router = DefaultRouter()

# Clientes
router.register(r'clientes', ClienteViewSet)
router.register(r'recordatorios', RecordatorioViewSet)
router.register(r'huellas', HuellaViewSet)

# Membresías
router.register(r'planes', PlanViewSet)
router.register(r'membresias', MembresiaViewSet)
router.register(r'ejercicios', EjercicioViewSet)

# Finanzas
router.register(r'pagos', PagoViewSet)
router.register(r'gastos-fijos', GastoFijoViewSet)
router.register(r'egresos', EgresoViewSet)
router.register(r'estados-cuenta', EstadoCuentaViewSet)

urlpatterns = [
    # Rutas del router
    path('', include(router.urls)),
    
    # Endpoint del Dashboard
    path('dashboard/overview/', dashboard_overview, name='dashboard-overview'),
]
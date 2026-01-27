from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PagoViewSet, GastoFijoViewSet, EgresoViewSet, EstadoCuentaViewSet

# ============================================
# ROUTER: Registra los ViewSets automáticamente
# ============================================

router = DefaultRouter()

# Registrar cada ViewSet con su prefijo de URL
router.register(r'pagos', PagoViewSet, basename='pagos')
router.register(r'gastos', GastoFijoViewSet, basename='gastos')
router.register(r'egresos', EgresoViewSet, basename='egresos')
router.register(r'estado', EstadoCuentaViewSet, basename='estado')

urlpatterns = [
    path('', include(router.urls)),
]

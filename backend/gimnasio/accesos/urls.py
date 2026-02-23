from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AccesoViewSet

router = DefaultRouter()
router.register(r'acceso', AccesoViewSet, basename='acceso')

urlpatterns = [
    path('', include(router.urls)),
]

# ============================================
# URLs generadas:
# ============================================
#
# GET    /api/accesos/acceso/              -> Lista todos los registros
# GET    /api/accesos/acceso/{id}/         -> Detalle de un registro
# POST   /api/accesos/acceso/validar/      -> Valida DNI y registra acceso
# GET    /api/accesos/acceso/hoy/          -> Registros del día actual
# GET    /api/accesos/acceso/stats_hoy/    -> Estadísticas del día
#
# ============================================

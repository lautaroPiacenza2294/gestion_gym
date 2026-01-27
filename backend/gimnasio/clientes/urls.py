from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, HuellaViewSet, RecordatorioViewSet

# ============================================
# ROUTER: Registra los ViewSets automáticamente
# ============================================

router = DefaultRouter()

# Registrar cada ViewSet con su prefijo de URL
router.register(r'cliente', ClienteViewSet, basename='cliente')
router.register(r'huellas', HuellaViewSet, basename='huella')
router.register(r'recordatorios', RecordatorioViewSet, basename='recordatorio')

urlpatterns = [
    path('', include(router.urls)),
]


# ============================================
# URLs que se generan automáticamente:
# ============================================
# 
# CLIENTES:
# GET    /api/clientes/clientes/                  -> Lista todos
# POST   /api/clientes/clientes/                  -> Crea nuevo
# GET    /api/clientes/clientes/{id}/             -> Detalle
# PUT    /api/clientes/clientes/{id}/             -> Actualiza completo
# PATCH  /api/clientes/clientes/{id}/             -> Actualiza parcial
# DELETE /api/clientes/clientes/{id}/             -> Elimina
# GET    /api/clientes/clientes/activos/          -> Endpoint custom (solo activos)
# GET    /api/clientes/clientes/cumpleanos_mes/   -> Endpoint custom (cumpleaños)
# POST   /api/clientes/clientes/{id}/activar/     -> Endpoint custom
# POST   /api/clientes/clientes/{id}/desactivar/  -> Endpoint custom
# 
# HUELLAS:
# GET    /api/clientes/huellas/                   -> Lista todas
# POST   /api/clientes/huellas/                   -> Crea nueva
# GET    /api/clientes/huellas/{id}/              -> Detalle
# PUT    /api/clientes/huellas/{id}/              -> Actualiza
# PATCH  /api/clientes/huellas/{id}/              -> Actualiza parcial
# DELETE /api/clientes/huellas/{id}/              -> Elimina
# POST   /api/clientes/huellas/{id}/desactivar/   -> Endpoint custom
# 
# RECORDATORIOS:
# GET    /api/clientes/recordatorios/             -> Lista todos
# POST   /api/clientes/recordatorios/             -> Crea nuevo
# GET    /api/clientes/recordatorios/{id}/        -> Detalle
# PUT    /api/clientes/recordatorios/{id}/        -> Actualiza
# PATCH  /api/clientes/recordatorios/{id}/        -> Actualiza parcial
# DELETE /api/clientes/recordatorios/{id}/        -> Elimina
# GET    /api/clientes/recordatorios/pendientes/  -> Endpoint custom
# GET    /api/clientes/recordatorios/hoy/         -> Endpoint custom
# POST   /api/clientes/recordatorios/{id}/enviar/ -> Endpoint custom
# POST   /api/clientes/recordatorios/{id}/cancelar/ -> Endpoint custom
# 
# ============================================


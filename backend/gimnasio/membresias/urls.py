from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EjercicioViewSet, PlanViewSet, MembresiaViewSet

# ============================================
# ROUTER: Registra los ViewSets automáticamente
# ============================================

router = DefaultRouter()

# Registrar cada ViewSet con su prefijo de URL
router.register(r'ejercicio', EjercicioViewSet, basename='ejercicio')
router.register(r'planes', PlanViewSet, basename='planes')
router.register(r'membresia', MembresiaViewSet, basename='membresia')

urlpatterns = [
    path('', include(router.urls)),
]

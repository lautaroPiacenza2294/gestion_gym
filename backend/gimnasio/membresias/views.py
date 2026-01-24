from django.shortcuts import render
from models import Ejercicio,Rutina,Semana,DiaEntrenamiento,EjercicioDia,Plan,Membresia

# Create your views here.
class MiembroViewSet(viewsets.ModelViewSet):
    queryset = Miembro.objects.all()
    serializer_class = MiembroSerializer
    
class EjercicioViewSet(viewsets.ModelViewSet):
    queryset = Ejercicio.objects.all()
    serializer_class = EjercicioSerializer
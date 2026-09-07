from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeadViewSet, ClientViewSet, ProjectViewSet

router = DefaultRouter()
router.register(r'leads', LeadViewSet)
router.register(r'clients', ClientViewSet)
router.register(r'projects', ProjectViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]


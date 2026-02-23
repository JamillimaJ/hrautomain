from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'candidates', views.CandidateViewSet, basename='candidate')
router.register(r'job-descriptions', views.JobDescriptionViewSet, basename='jobdescription')
router.register(r'analysis-jobs', views.AnalysisJobViewSet, basename='analysisjob')

urlpatterns = [
    path('', include(router.urls)),
    path('sync-drive/', views.sync_drive, name='sync-drive'),
    path('upload-resume/', views.upload_resume, name='upload-resume'),
    path('analyze-resumes/', views.analyze_resumes, name='analyze-resumes'),
    path('send-notifications/', views.send_bulk_notifications, name='send-notifications'),
    path('send-appointment-letters/', views.send_bulk_appointment_letters, name='send-appointment-letters'),
    path('dashboard-stats/', views.dashboard_stats, name='dashboard-stats'),
    path('emails/', views.get_email_analysis, name='get-email-analysis'),
    path('update-emails/', views.update_email_analysis, name='update-email-analysis'),
]

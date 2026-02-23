from django.contrib import admin
from .models import Candidate, JobDescription, AnalysisJob


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ['candidate_name', 'score', 'verdict', 'status', 'email', 'phone', 'created_at']
    list_filter = ['status', 'verdict', 'created_at']
    search_fields = ['candidate_name', 'email', 'phone']
    ordering = ['-score', '-created_at']


@admin.register(JobDescription)
class JobDescriptionAdmin(admin.ModelAdmin):
    list_display = ['title', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'description']


@admin.register(AnalysisJob)
class AnalysisJobAdmin(admin.ModelAdmin):
    list_display = ['id', 'status', 'total_resumes', 'processed_resumes', 'shortlisted_count', 'created_at']
    list_filter = ['status', 'created_at']
    ordering = ['-created_at']

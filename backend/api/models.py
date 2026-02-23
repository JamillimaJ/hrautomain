from django.db import models


class Candidate(models.Model):
    """Model to store candidate information and ATS scores"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
        ('notified', 'Notified'),
        ('appointed', 'Appointed'),
    ]
    
    candidate_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    years_of_experience = models.CharField(max_length=50, blank=True, null=True)
    score = models.IntegerField(default=0)
    fitness_reasoning = models.TextField(blank=True)
    matching_skills = models.TextField(blank=True)
    missing_skills = models.TextField(blank=True)
    verdict = models.CharField(max_length=50, default='Pending')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    resume_file = models.CharField(max_length=255, blank=True)
    
    # Appointment letter fields
    position_title = models.CharField(max_length=255, blank=True, null=True)
    department = models.CharField(max_length=255, blank=True, null=True)
    salary = models.CharField(max_length=100, blank=True, null=True)
    start_date = models.CharField(max_length=100, blank=True, null=True)
    probation_months = models.IntegerField(default=3, blank=True, null=True)
    appointment_sent = models.BooleanField(default=False)
    appointment_sent_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-score', '-created_at']
    
    def __str__(self):
        return f"{self.candidate_name} - Score: {self.score}"


class JobDescription(models.Model):
    """Model to store job descriptions"""
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField(blank=True)
    file_path = models.CharField(max_length=500, default='data/templates/hiring_post.pdf')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class AnalysisJob(models.Model):
    """Model to track analysis jobs"""
    
    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    job_description = models.ForeignKey(JobDescription, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
    total_resumes = models.IntegerField(default=0)
    processed_resumes = models.IntegerField(default=0)
    shortlisted_count = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Job {self.id} - {self.status}"

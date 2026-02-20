from django.contrib import admin
from .models import Recording


@admin.register(Recording)
class RecordingAdmin(admin.ModelAdmin):
    list_display = ['display_title', 'event', 'uploaded_by', 'duration_minutes', 'is_public', 'uploaded_at']
    list_filter = ['is_public', 'uploaded_at', 'event']
    search_fields = ['title', 'description', 'event__title', 'uploaded_by__username']
    readonly_fields = ['uploaded_at']
    date_hierarchy = 'uploaded_at'
    
    fieldsets = (
        ('Recording Information', {
            'fields': ('event', 'title', 'description')
        }),
        ('Media', {
            'fields': ('recording_link', 'duration_minutes')
        }),
        ('Access Control', {
            'fields': ('is_public',)
        }),
        ('Metadata', {
            'fields': ('uploaded_by', 'uploaded_at'),
            'classes': ('collapse',)
        }),
    )

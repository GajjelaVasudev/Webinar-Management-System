from django.contrib import admin
from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'date', 'time', 'duration', 'price', 'organizer', 'get_status', 'created_at']
    list_filter = ['date', 'manual_status', 'created_at']
    search_fields = ['title', 'description', 'organizer__username']
    readonly_fields = ['created_at', 'updated_at', 'get_status']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'organizer')
        }),
        ('Schedule', {
            'fields': ('date', 'time', 'duration')
        }),
        ('Pricing', {
            'fields': ('price',)
        }),
        ('Media', {
            'fields': ('thumbnail', 'live_stream_url')
        }),
        ('Status', {
            'fields': ('manual_status', 'get_status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_status(self, obj):
        return obj.get_status()
    get_status.short_description = 'Current Status'

from django.contrib import admin
from .models import LiveSession, LiveSessionParticipant


@admin.register(LiveSession)
class LiveSessionAdmin(admin.ModelAdmin):
    list_display = ('webinar', 'room_name', 'is_active', 'started_by', 'created_at', 'start_time', 'end_time')
    list_filter = ('is_active', 'created_at', 'start_time', 'end_time')
    search_fields = ('webinar__title', 'room_name')
    readonly_fields = ('room_name', 'created_at', 'started_at', 'start_time', 'end_time')
    fieldsets = (
        ('Session Info', {
            'fields': ('webinar', 'room_name', 'is_active')
        }),
        ('Timing', {
            'fields': ('created_at', 'started_at', 'start_time', 'end_time')
        }),
        ('Started By', {
            'fields': ('started_by',)
        }),
    )


@admin.register(LiveSessionParticipant)
class LiveSessionParticipantAdmin(admin.ModelAdmin):
    list_display = ('session', 'user', 'joined_at')
    list_filter = ('joined_at',)
    search_fields = ('session__webinar__title', 'user__username', 'user__email')
    readonly_fields = ('joined_at',)

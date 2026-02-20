from django.contrib import admin
from .models import Registration


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ['user', 'event', 'registered_on', 'attended']
    list_filter = ['attended', 'registered_on', 'event']
    search_fields = ['user__username', 'user__email', 'event__title']
    readonly_fields = ['registered_on']
    date_hierarchy = 'registered_on'
    
    fieldsets = (
        ('Registration Details', {
            'fields': ('user', 'event', 'attended')
        }),
        ('Timestamps', {
            'fields': ('registered_on',),
            'classes': ('collapse',)
        }),
    )

from django.contrib import admin
from .models import Announcement, UserNotification, WebinarChatMessage, Conversation, Message


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'sender', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['title', 'content', 'sender__username']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Announcement Details', {
            'fields': ('sender', 'title', 'content')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserNotification)
class UserNotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['title', 'content', 'user__username']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Notification Details', {
            'fields': ('user', 'notification_type', 'title', 'content')
        }),
        ('Related Objects', {
            'fields': ('announcement', 'event', 'recording', 'related_webinar')
        }),
        ('Status', {
            'fields': ('is_read',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(WebinarChatMessage)
class WebinarChatMessageAdmin(admin.ModelAdmin):
    list_display = ['user', 'event', 'message_preview', 'created_at']
    list_filter = ['created_at', 'event']
    search_fields = ['message', 'user__username', 'event__title']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Message Details', {
            'fields': ('event', 'user', 'message')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def message_preview(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    message_preview.short_description = 'Message'


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'participants_list', 'related_webinar', 'last_message_at', 'created_at']
    list_filter = ['created_at', 'last_message_at', 'related_webinar']
    search_fields = ['participants__username', 'related_webinar__title']
    readonly_fields = ['created_at', 'updated_at', 'last_message_at']
    date_hierarchy = 'created_at'
    filter_horizontal = ['participants']
    
    fieldsets = (
        ('Conversation Details', {
            'fields': ('participants', 'related_webinar')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_message_at'),
            'classes': ('collapse',)
        }),
    )
    
    def participants_list(self, obj):
        return ", ".join([user.username for user in obj.participants.all()[:5]])
    participants_list.short_description = 'Participants'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender', 'conversation', 'content_preview', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['content', 'sender__username']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Message Details', {
            'fields': ('conversation', 'sender', 'content')
        }),
        ('Status', {
            'fields': ('is_read',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def content_preview(self, obj):
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content'

from django.contrib import admin
from django.utils.html import format_html

from .models import Event, Recording, Registration, Announcement, UserNotification


class EventAdmin(admin.ModelAdmin):
	list_display = ('title', 'date', 'time', 'duration', 'organizer', 'attendees_count', 'thumbnail_preview')
	list_filter = ('date', 'organizer')
	search_fields = ('title', 'description')
	readonly_fields = ('thumbnail_preview', 'attendees_count')
	fieldsets = (
		('Basic Information', {
			'fields': ('title', 'description', 'organizer'),
		}),
		('Schedule', {
			'fields': ('date', 'time', 'duration'),
		}),
		('Media', {
			'fields': ('thumbnail', 'thumbnail_preview'),
		}),
	)

	def thumbnail_preview(self, obj):
		if obj.thumbnail:
			return format_html(
				'<img src="{}" width="100" height="75" style="object-fit: cover; border-radius: 4px;" />',
				obj.thumbnail.url
			)
		return "No thumbnail"
	thumbnail_preview.short_description = "Thumbnail Preview"

	def attendees_count(self, obj):
		return obj.registrations.count()
	attendees_count.short_description = "Attendees"


class AnnouncementAdmin(admin.ModelAdmin):
	list_display = ('title', 'sender', 'created_at')
	list_filter = ('created_at', 'sender')
	search_fields = ('title', 'content')
	readonly_fields = ('created_at', 'updated_at', 'sender')
	fieldsets = (
		('Announcement', {
			'fields': ('title', 'content'),
		}),
		('Metadata', {
			'fields': ('sender', 'created_at', 'updated_at'),
		}),
	)

	def save_model(self, request, obj, form, change):
		if not change:  # Creating new
			obj.sender = request.user
		super().save_model(request, obj, form, change)


class UserNotificationAdmin(admin.ModelAdmin):
	list_display = ('title', 'user', 'notification_type', 'is_read', 'created_at')
	list_filter = ('notification_type', 'is_read', 'created_at')
	search_fields = ('title', 'content', 'user__username')
	readonly_fields = ('user', 'notification_type', 'title', 'content', 'created_at')

	def has_add_permission(self, request):
		return False  # Auto-created via API

	def has_delete_permission(self, request, obj=None):
		return False  # Don't allow deletion


admin.site.register(Event, EventAdmin)
admin.site.register(Registration)
admin.site.register(Recording)
admin.site.register(Announcement, AnnouncementAdmin)
admin.site.register(UserNotification, UserNotificationAdmin)

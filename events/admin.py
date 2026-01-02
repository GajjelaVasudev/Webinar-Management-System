from django.contrib import admin

from .models import Event, Recording, Registration


admin.site.register(Event)
admin.site.register(Registration)
admin.site.register(Recording)

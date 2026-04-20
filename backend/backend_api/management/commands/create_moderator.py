from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create a moderator account (is_staff=True). Defaults to username=admin, password=admin.'

    def add_arguments(self, parser):
        parser.add_argument('--username', default='admin', help='Moderator username (default: admin)')
        parser.add_argument('--password', default='admin', help='Moderator password (default: admin)')

    def handle(self, *args, **options):
        username = options['username']
        password = options['password']

        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            user.is_staff = True
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(
                f'Updated existing user "{username}" with moderator privileges.'
            ))
        else:
            User.objects.create_user(username=username, password=password, is_staff=True)
            self.stdout.write(self.style.SUCCESS(
                f'Created moderator account "{username}".'
            ))
